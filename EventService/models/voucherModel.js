const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoucherSchema = new Schema({
    voucher_name: {
        type: String,
        required: true
    },
    percent: {
        type: Number,
        required: true
    },
    num_voucher: {
        type: Number,
        required: true
    },
    remaining_voucher: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    event_id: {
        type: Schema.Types.ObjectId,
        ref: 'events',
        required: true
    }
});

module.exports = Voucher = mongoose.model("voucher", VoucherSchema);
