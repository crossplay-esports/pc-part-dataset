import fs from 'fs';
import { PartType } from "../types";
import path from 'path';

export const ALL_ENDPOINTS: PartType[] = [
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


export const loadJSON = (fileName: string) => {
    const fpath = path.resolve(__dirname, `../../data/json/${fileName}.json`);
    console.log(fpath)
    const obj = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
    return obj
}