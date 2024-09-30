import { model, Schema } from "mongoose";


const gpuSchema = new Schema({
    name: String,
    price: Number,
    chipset: String,
    memory: Number,
    core_clock: Number,
    boost_clock: Number,
    color: String,
    length: Number,
    description: String
}, {timestamps: true});

// gpuSchema.virtual('description').get(function() {
//     return `${this.name} ${this.chipset} ${this.memory} GB`
// })

gpuSchema.pre('save', function(next) {
    this.description = `${this.name} ${this.chipset} ${this.memory} GB ${this.color}`;
    next()
})

gpuSchema.pre('findOneAndUpdate', function(next) {
    const update: any = this.getUpdate();
    let color = update.color;
    if(color == null || !color || color === null) { color = undefined}
    if(!update.description) {
        update.description = `${update.name} ${update.chipset} ${update.memory} GB${color ? '' : ` ${color}`}`
    }
    next()
})



const Videocard = model('Videocard', gpuSchema);

export default Videocard;