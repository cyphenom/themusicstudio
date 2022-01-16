const {
    Schema,
    model
} = require('mongoose');

module.exports = model("attendance", new Schema({
    userId: String,
    lessonId: String,
    name: String,
    email: String,
    lesson: String,
    time: String,
}));