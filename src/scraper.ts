import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import type { Page } from 'puppeteer'
import { Cluster } from 'puppeteer-cluster'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { connect } from 'puppeteer-real-browser';


import untypedMap from './serialization-map.json'
import {
	customSerializers,
	genericSerialize,
	serializeNumber,
} from './serializers'
import type { Part, PartType, SerializationMap } from './types'

const BASE_URL = 'https://pcpartpicker.com/products'
const STAGING_DIRECTORY = 'data-staging'
const ALL_ENDPOINTS: PartType[] = [
	'cpu',
	'cpu-cooler',
	'motherboard',
	'memory',
	'internal-hard-drive',
	'video-card',
	'case',
	'power-supply',
	'os',
	'monitor',
	'sound-card',
	'wired-network-card',
	'wireless-network-card',
	'headphones',
	'keyboard',
	'mouse',
	'speakers',
	'webcam',
	'case-accessory',
	'case-fan',
	'fan-controller',
	'thermal-paste',
	'external-hard-drive',
	'optical-drive',
	'ups',
]

puppeteer.use(StealthPlugin())

const map = untypedMap as unknown as SerializationMap

//@ts-ignore
async function scrapeInParallel(endpoints: PartType[]) {
	await mkdir(join(STAGING_DIRECTORY, 'json'), { recursive: true })

	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 5,
		timeout: 1000 * 60 * 20, // 20 minutes
		puppeteer,
		puppeteerOptions: {
			headless: false,
		},
	})

	await cluster.task(async ({ page, data: endpoint }) => {
		await page.setViewport({ width: 1920, height: 1080 })

		let fileName = endpoint
		const allParts = []

		try {
			for await (const pageParts of scrape(endpoint, page)) {
				allParts.push(...pageParts)
			}
		} catch (error) {
			console.warn(`[${endpoint}] Aborted unexpectedly:\n\t${error}`)

			if (allParts.length) fileName += '.incomplete'
			else return
		}

		await writeFile(
			join(STAGING_DIRECTORY, 'json', `${fileName}.json`),
			JSON.stringify(allParts)
		)
	})
	//@ts-ignore
	cluster.queue('https://pcpartpicker.com', async ({ page, data }) => {
		// @ts-ignore
		const { browser, page:page1 } = await connect({
			headless: false,
	
			args: [],
	
			customConfig: {},
	
			turnstile: true,
	
			connectOption: {},
	
			disableXvfb: false,
			ignoreAllFlags: false
			// proxy:{
			//     host:'<proxy-host>',
			//     port:'<proxy-port>',
			//     username:'<proxy-username>',
			//     password:'<proxy-password>'
			// }
		})

		const res = await page1.goto(data)
		await new Promise(r => setTimeout(r, 30000));
		await page1.screenshot({ path: `${new Date().getTime()}.png`, fullPage: true })

		try {
			await page1.waitForSelector('nav', { timeout: 15000 })
		} catch (e) {
			console.log(e);
			console.log(res)
			console.error(
				`Initial fetch test failed (HTTP ${res?.status() ?? '?'
				}). Try running with \`{ headless: false }\` to see what the problem is.`
			)
			return
		}

		for (const endpoint of endpoints) {
			cluster.queue(endpoint)
		}
	})

	await cluster.idle()
	await cluster.close()
}

async function* scrape(endpoint: PartType, page: Page): AsyncGenerator<Part[]> {
	await page.setRequestInterception(true)

	page.on('request', (req) => {
		switch (req.resourceType()) {
			case 'font':
			case 'image':
			case 'stylesheet': {
				req.abort()
				break
			}
			default:
				req.continue()
		}
	})

	await page.goto(`${BASE_URL}/${endpoint}`)

	const paginationEl = await page.waitForSelector('.pagination', {
		timeout: 5000,
	})

	// NOTE: We are banging paginationEl because Page.waitForSelector()
	// only returns null when using option `hidden: true`, which we
	// are not using.
	// See: https://pptr.dev/api/puppeteer.page.waitforselector#parameters
	const numPages = await paginationEl!.$eval('li:last-child', (el) =>
		parseInt(el.innerText)
	)

	for (let currentPage = 1; currentPage <= numPages; currentPage++) {
		const pageProducts: Part[] = []

		if (currentPage > 1) {
			await page.goto(`${BASE_URL}/${endpoint}/#page=${currentPage}`)
			await page.waitForNetworkIdle()
		}

		const productEls = await page.$$('.tr__product')

		for (const productEl of productEls) {
			const serialized: Part = {}

			serialized['name'] = await productEl.$eval(
				'.td__name .td__nameWrapper > p',
				(p) => p.innerText.replaceAll('\n', ' ')
			)

			const priceText = await productEl.$eval(
				'.td__price',
				(td) => td.textContent
			)

			if (priceText == null || priceText.trim() === '')
				serialized['price'] = null
			else serialized['price'] = serializeNumber(priceText)

			const specs = await productEl.$$('td.td__spec')

			for (const spec of specs) {
				const specName = await spec.$eval('.specLabel', (l) =>
					(l as HTMLHeadingElement).innerText.trim()
				)
				const mapped = map[endpoint][specName]

				if (typeof mapped === 'undefined')
					throw new Error(`No mapping found for spec '${specName}'`)

				const [snakeSpecName, mappedSpecSerializationType] = mapped

				const specValue = await spec.evaluate(
					(s) => s.childNodes[1]?.textContent
				)

				if (specValue == null || specValue.trim() === '') {
					serialized[snakeSpecName] = null
				} else if (mappedSpecSerializationType === 'custom') {
					serialized[snakeSpecName] =
						customSerializers[endpoint]![snakeSpecName]!(specValue)
				} else {
					serialized[snakeSpecName] = genericSerialize(
						specValue,
						mappedSpecSerializationType
					)
				}
			}

			pageProducts.push(serialized)
		}

		yield pageProducts
	}
}

const inputEndpoints = process.argv.slice(2)
//@ts-ignore
const endpointsToScrape = inputEndpoints.length
	? (inputEndpoints as PartType[])
	: ALL_ENDPOINTS;

scrapeInParallel(endpointsToScrape)
// ( async () => {
// try {
// // @ts-ignore
// 	const { browser, page } = await connect({
// 		headless: false,

//         args: [],

//         customConfig: {},

//         turnstile: true,

//         connectOption: {},

//         disableXvfb: false,
//         ignoreAllFlags: false
//         // proxy:{
//         //     host:'<proxy-host>',
//         //     port:'<proxy-port>',
//         //     username:'<proxy-username>',
//         //     password:'<proxy-password>'
//         // }
// 	})
// 	// await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5643.204 Safari/537.36')
// 	await page.goto('https://pcpartpicker.com');

// 	await new Promise(r => setTimeout(r, 30000));
// 	console.log('set screenshot');
// 	await page.screenshot({
// 		path: `${new Date().getTime()}.png`,
// 		fullPage: true
// 	})

// 	process.exit(-1);
// } catch (e) {
// 	console.log(e)
// }
// })()