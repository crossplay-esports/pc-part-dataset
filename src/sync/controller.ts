import mongoose, { Model } from "mongoose"
import { ALL_ENDPOINTS, loadJSON } from "./utils";
import { getModel } from "./models";

const ENDPTS = [...ALL_ENDPOINTS];

export const connectMongoose = async () => {

    await mongoose.connect(`mongodb+srv://${process.env["MONGO_USERNAME"]}:${process.env["MONGO_PW"]}@pcdatascrape.wx5ab.mongodb.net/?retryWrites=true&w=majority&appName=pcdatascrape`, {
        dbName: 'pcscrape'
    });
    // TODO : MONGO RW TEST
    return;
}

export const syncData = async (endpoint: string, doBulk?: boolean) => {
    if(doBulk) {
        throw 'bulk will not support transformer middlewares'
    }
    if(endpoint) {
        const hasEndpt = ENDPTS.find((str) => str === endpoint);
        if(hasEndpt) {
            // if(doBulk) {
            //     return syncOneBulk(endpoint)
            // }
            return syncOneAsync(endpoint)
        }
        else {
            throw 'category not found';
        }
    }

    // const ret = ENDPTS.map(e => syncOne(e))

}


const syncOneAsync = async(category: string) => {
    const genericModel = getModel(category);

    const data = loadJSON(category);
    
    if(!data || !genericModel) {
        throw 'invalid data or model';
    }

    console.log(`incoming count : ${category} : ${data.length}`)

    data.forEach((d: Record<string, any>) => {
        const { name, price } = d;
        // if(price == null || !price || !name || name == null) {
        //     return;
        // }
        console.log(`updating ${name}`)
        genericModel.findOneAndUpdate(
            {
                name,
                price
            },
            d,
            {
                upsert: true,
                new: true
            }
        )
        .then((dat: any) => console.log(`saved ${name}   |    ${dat?.description}`))
        .catch((e: any) => console.log(e))
    })


}

/**
 * Sync Bulk is good for write operations
 * but the schema pre ops are not running this way
 * @param category 
 */

// const syncOneBulk = async(category: string) => {
//     const genericModel: Model<any> = getModel(category);

//     const data = loadJSON(category);
    
//     if(!data || !genericModel) {
//         throw 'invalid data or model';
//     }

//     console.log(`incoming count : ${category} : ${data.length}`)

//     const bulkData = data.map((data: any) => {
//         const { name, price } = data;
//         return {
//             updateOne: {
//                 filter: {name, price},
//                 update: {$set: data},
//                 upsert: true,
//             }
//         }
//     })

//     genericModel.bulkWrite(bulkData).then((result: any) => {
//         console.log('success bulk upsert', result)
//     }).catch((err: Error) => {
//         console.log('bulk upsert error', err)
//     })


// }