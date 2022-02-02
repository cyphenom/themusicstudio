const {
    Schema,
    model
} = require('mongoose');

module.exports = model("lessons", new Schema({
    userId: String,
    name: String,
    email: String,
    day: String,
    start: String,
    end: String,
    prevLesson: Array,
    prevDate: Array,
    lessons: Number,
    disabled: { type: Boolean, default: false }
}));