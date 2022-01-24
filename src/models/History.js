const {
    Schema,
    model
} = require('mongoose');

module.exports = model("history", new Schema({
    userId: String,
    tuitionId: String,
    name: String,
    email: String,
    grandTotal: String,
    rentalInstrument: String,
    rentalFee: String,
    tuitionFee: String,
    specialFee: String,
    time: Date,
    type: String,
}));