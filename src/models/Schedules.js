const {
    Schema,
    model
} = require('mongoose');

module.exports = model("schedules", new Schema({
    userId: String,
    name: String,
    email: String,
    day: String,
    start: String,
    end: String,
    duration: String,
    disabled: { type: Boolean, default: false }
}));