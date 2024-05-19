const mongoose = require('mongoose');
const Event = require('../models/eventModel'); // Đường dẫn đến file định nghĩa model Event
const Seat = require('../models/seatModel'); // Đường dẫn đến file định nghĩa model Seat

const getAllSeats = async (req, res) => {
    try {
        const { event_id } = req.params;
        const seats = await Seat.find({ event_id });
        res.status(200).json(seats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the seats' });
    }
};

const updateSeat = async (req, res) => {
    try {
        const { seat_id } = req.params;
        const seat = await Seat.findById(seat_id);
        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        seat.status = "inactive";
        await seat.save();
        res.status(200).json({ message: 'Seat status updated successfully', seat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the seat status' });
    }
};

const getOneSeat = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        res.status(200).json(seat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllSeats,
    updateSeat,
    getOneSeat
};
