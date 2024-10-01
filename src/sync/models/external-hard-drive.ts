import { Schema } from "mongoose";


const extHDDSchema = new Schema({
    name: String,
    price: String,
    type: String,
    interface: String,
    capacity: String,
    price_per_gb: Number,
    color: String,
    capacityTB: Number,
    description: String
}, {timestamps: true})

extHDDSchema.pre('save', function (next) {
    return next(new Error('This operation is not allowed.'));
});

extHDDSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate()
})