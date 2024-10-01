import { model, Schema } from "mongoose";
import { parseAttributeToDescription } from "../utils";



const caseFanSchema = new Schema({
    name: String,
    price: Number,
    size: Number,
    color: String,
    rpm: Schema.Types.Mixed,
    airflow: Schema.Types.Mixed,
    noise_level: Schema.Types.Mixed,
    pwm: Boolean,
    description: String
}, { timestamps: true });

caseFanSchema.pre('save', function (next) {
    let color = this.color;
    if (color == null || !color || color === null) { color = undefined }
    this.description = `${this.name}${color ? '' : ` ${color}`} `;
    next()
});

caseFanSchema.pre('findOneAndUpdate', function (next) {
    const update: any = this.getUpdate();
    let color = update.color || '';
    const size = update.size ? ` ${update.size} mm` : '';

    let rpm = update.rpm || '';
    let airflow = update.airflow || '';
    let noise_level = update.noise_level || '';

    rpm = parseAttributeToDescription(rpm, 'RPM', 'Speed');
    airflow = parseAttributeToDescription(airflow, 'CFM', 'Airflow');
    noise_level = parseAttributeToDescription(noise_level, 'dB', 'Noise')



    if (color == null || !color || color === null) { color = undefined }
    if (!update.description) {
        update.description = `${update.name}${size}${rpm}${airflow}${noise_level}${color ? '' : ` ${color}`}`
    }
    next()
});


const caseFan = model('caseFan', caseFanSchema);

export default caseFan;
