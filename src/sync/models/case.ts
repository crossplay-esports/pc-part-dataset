import { model, Schema } from "mongoose";


const caseSchema = new Schema({
    name: String,
    price: Number,
    type: String,
    color: String,
    psu: String,
    side_panel: String,
    external_volume: Number,
    internal_35_bays: Number,
    description: String,
}, { timestamps: true })

caseSchema.pre('findOneAndUpdate', function(next) {
    const update: any = this.getUpdate();

    const fields = [
        update.name || '',
        update.type || '',
        update.side_panel || '',
        update.psu ? `${update.psu} W` : '',
        update.external_volume ? `Ext Volume: ${update.external_volume} L` : '',
        update.internal_35_bays ? `${update.internal_35_bays} HDD bays` : ''
    ];

    const description = fields.filter(Boolean).join(' ');

    update.description = description;

    next();

});

caseSchema.pre('save', function(next) {
    const fields = [
        this.name || '',
        this.type || '',
        this.side_panel || '',
        this.psu ? `${this.psu} W` : '',
        this.external_volume ? `Ext Volume: ${this.external_volume} L` : '',
        this.internal_35_bays ? `${this.internal_35_bays} HDD bays` : ''
    ];

    // Filter out empty strings and join the remaining parts
    const description = fields.filter(Boolean).join(' ');

    // Set the compositeField value
    this.description = description;

    next();
});

const Case = model('Case', caseSchema);

export default Case;

