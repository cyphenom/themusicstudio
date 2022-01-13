const {
    Schema,
    model
} = require('mongoose');

module.exports = model("tuitions", new Schema({
    userId: String,
    name: String,
    email: String,
    tuition: String,
    grandTotal: String,
    lessons: String,
    lessonDuration: String,
    rentalInstrument: String,
    rentalFee: String,
    special: String,
    specialFee: String,
    disabled: { type: Boolean, default: false }
}));