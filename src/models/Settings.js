const {
    Schema,
    model
} = require('mongoose');

module.exports = model("settings", new Schema({
    siteName: String,
}));