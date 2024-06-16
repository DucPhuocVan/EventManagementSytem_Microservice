const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingTempSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    seat_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    voucher_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
    detail: {
        type: String,
        required: true,
        default: 'pending'
    },
    created_date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = BookingTemp = mongoose.model("bookingtemp", BookingTempSchema);