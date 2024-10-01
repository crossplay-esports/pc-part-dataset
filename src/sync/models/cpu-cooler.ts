import { model, Schema } from "mongoose";
import { parseAttributeToDescription } from "../utils";


const cpuCoolerSchema = new Schema({
    name: String,
    price: Number,
    rpm: Schema.Types.Mixed,
    noise_level: Schema.Types.Mixed,
    color: String,
    size: String,
    description: String

},  {timestamps: true})

cpuCoolerSchema.pre('findOneAndUpdate', function(next) {
    const update: any = this.getUpdate();
    let color = update.color || '';
    color = color ? ` ${color}` : '';
    let rpm = update.rpm || '';
    let noise_level = update.noise_level || '';
    let size = update.size || ''

    rpm = parseAttributeToDescription(rpm, 'RPM', 'Speed');
    noise_level = parseAttributeToDescription(noise_level, 'dB', 'Noise')
    size= parseAttributeToDescription(size, 'mm', 'Size')


    // if (color == null || !color || color === null) { color = undefined }
    if (!update.description) {
        update.description = `${update.name}${size}${rpm}${noise_level}${color}`
    }
    next()
})

const Cpucooler = model('Cpucooler', cpuCoolerSchema);

export default Cpucooler;