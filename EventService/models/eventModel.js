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

const EventSchema = new Schema({
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
    total_seat: {
        type: Number,
        required: true
    },
    remaining_seat: {
        type: Number,
        required: true
    },
    owner_id: {
        type: Number,
        required: true
    }
});

module.exports = Event = mongoose.model("event", EventSchema);