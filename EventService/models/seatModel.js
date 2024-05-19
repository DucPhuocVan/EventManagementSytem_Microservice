const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SeatSchema = new Schema({
    seat_type: {
        type: String,
        required: true
    },
    seat_code: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    event_id: {
        type: Schema.Types.ObjectId,
        ref: 'events',
        required: true
    }
});


module.exports = Seat = mongoose.model("seat", SeatSchema);