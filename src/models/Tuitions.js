const {
    Schema,
    model
} = require('mongoose');

module.exports = model("tuitions", new Schema({
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
}));