import { model, Schema } from "mongoose";



const cpuSchema = new Schema({
    name: String,
    price: Number,
    core_count: Number,
    core_clock: Number,
    boost_clock: Number,
    tdp: Number,
    graphics: String,
    smt: Boolean
}, {timestamps: true})

const Cpu = model('Cpu', cpuSchema);

export default Cpu;