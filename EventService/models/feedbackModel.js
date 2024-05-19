const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    star: {
        type: Number, // Mongoose uses Number for both integers and floats
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user_id: {
        type: Number,
        required: true // assuming user_id should not be null
    },
    event_id: {
        type: Number,
        required: true // assuming event_id should not be null
    },
    created_date: {
        type: Date,
        default: Date.now // sets the default value to the current date
    }
});

module.exports = Feedback = mongoose.model("feedback", FeedbackSchema);