const {
    Schema,
    model
} = require('mongoose');

module.exports = model("settings", new Schema({
    type: String,
    siteName: String,
    instruments: Array
}));