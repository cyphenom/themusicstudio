const {
    Schema,
    model
} = require('mongoose');

module.exports = model("lessons", new Schema({
    userId: String,
    name: String,
    email: String,
    prevLesson: Array,
    prevDate: Array,
    lessons: Number,
    deleted: { type: Boolean, default: false }
}));