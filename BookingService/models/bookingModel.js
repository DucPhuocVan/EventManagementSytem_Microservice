const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    time: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        required: true
    }
});

const AgendaSchema = new Schema({
    activities: [ActivitySchema]
});

const BookingSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    event_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    event_name: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    agenda: {
        type: AgendaSchema,
        required: true
    },
    seat_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    seat_type: {
        type: String,
        required: true
    },
    seat_code: {
        type: String,
        required: true
    },
    voucher_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    payment_method: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        required: true
    }
});

module.exports = Booking = mongoose.model("booking", BookingSchema);