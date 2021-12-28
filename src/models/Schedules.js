const {
    Schema,
    model
} = require('mongoose');

module.exports = model("schedules", new Schema({
    name: String,
    email: String,
    day: String,
    start: String,
    end: String,
}));