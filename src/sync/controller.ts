import mongoose from "mongoose"
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

export const syncData = async (endpoint: string) => {
    if(endpoint) {
        const hasEndpt = ENDPTS.find((str) => str === endpoint);
        if(hasEndpt) {
            return syncOne(endpoint)
        }
        else {
            throw 'category not found';
        }
    }

    // const ret = ENDPTS.map(e => syncOne(e))

}


const syncOne = async(category: string) => {
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
                upsert: true
            }
        )
        .then((dat: any) => console.log(`saved ${name}   |    ${dat?.description}`))
        .catch((e: any) => console.log(e))
    })


}