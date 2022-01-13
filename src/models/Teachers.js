const {
    Schema,
    model
} = require('mongoose');

module.exports = model("teachers", new Schema({
    name: String,
    email: String,
    password: String
}));