const {
    Schema,
    model
} = require('mongoose');

module.exports = model("invoices", new Schema({
    tuitionId: String,
    name: String,
    email: String,
    grandTotal: String,
    time: String,
}));