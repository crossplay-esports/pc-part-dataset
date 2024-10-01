import { model, Schema } from "mongoose";


const caseAccessorySchema = new Schema({
    name: String,
    price: Number,
    type: String,
    form_factor: Number
}, {timestamps: true});

const caseAccessory = model('Caseaccessory', caseAccessorySchema);
export default caseAccessory;