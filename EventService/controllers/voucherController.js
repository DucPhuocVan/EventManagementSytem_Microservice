const mongoose = require('mongoose');
const Event = require('../models/eventModel'); // Đường dẫn đến file định nghĩa model Event
const Voucher = require('../models/voucherModel'); // Đường dẫn đến file định nghĩa model Voucher

const addVoucher = async (req, res) => {
    try {
        const info = req.body;
        const voucher = new Voucher(info);
        await voucher.save();
        res.status(200).json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while adding the voucher' });
    }
};

const getVoucherByEvent = async (req, res) => {
    try {
        const { event_id } = req.params;
        const vouchers = await Voucher.find({ event_id });
        res.status(200).json(vouchers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the vouchers' });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const { voucher_id } = req.body;
        const voucher = await Voucher.findById(voucher_id);
        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }
        if (voucher.remaining_voucher <= 0) {
            return res.status(400).json({ error: 'Voucher is out of stock' });
        }
        voucher.remaining_voucher -= 1;
        await voucher.save();
        if (voucher.remaining_voucher === 0) {
            return res.status(200).json({ message: 'Voucher used successfully. Voucher is now out of stock.', voucher });
        }
        res.status(200).json({ message: 'Voucher used successfully', voucher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while using the voucher' });
    }
};

const getOneVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }
        res.status(200).json(voucher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addVoucher,
    getVoucherByEvent,
    updateVoucher,
    getOneVoucher
};