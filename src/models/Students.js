const {
    Schema,
    model
} = require('mongoose');

module.exports = model("students", new Schema({
    name: String,
    birthDate: String,
    email: String,
    password: String,
    phoneNumber: String,
    gender: String,
    address: String,
    instrument: String,
    deleted: { type: Boolean, default: false }
}));