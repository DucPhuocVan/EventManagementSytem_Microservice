const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const { consumer } = require('../config/kafkaConfig');
const topic = 'succeeded'

console.log("Starting consumer");
consumer.connect();
consumer.subscribe({ topic: 'succeeded' });

const runConsumer = async () => {
    console.log("Consumer running");
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("Consuming Booking service");
            try {
                const bookingData = JSON.parse(message.value.toString());
                console.log(bookingData);
                await createBooking(bookingData);
            } catch (error) {
                console.error('Failed to process message', error);
            }
        }
    });
};

// 1. Create a new Booking
const createBooking = async (bookingData) => {
    if (!bookingData) {
        console.error('Received undefined bookingData');
        return;
    }
    const { user_id, event_id, event_name, start_date, location, agenda, seat_id, seat_type, seat_code, price, voucher_id, percent} = bookingData;
    const payment_method = "payment";
    const total = price * (100 - percent)/100;
    try {
        // Create booking
        const newBooking = new Booking({
            user_id,
            event_id,
            event_name,
            start_date,
            location,
            agenda,
            seat_id,
            seat_type,
            seat_code,
            voucher_id,
            total,
            payment_method,
            status: 'pending',
            created_date: new Date()
        });
        await newBooking.save();
        console.log(newBooking);
        res.status(200).json({ message: 'Booking created successfully', newBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the event and seats' });
    }
};

// 2. Delete booking
const deleteBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Delete booking
        await Booking.findByIdAndDelete(bookingId);

        return res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 3. Update status booking
const updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = "Completed";
        await booking.save();

        return res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 4. Get 1 bookings
const getOneBooking = async (req, res) => {
    const { booking_id } = req.params;

    try {
        const bookings = await Booking.find({ _id: booking_id });
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found' });
        }

        return res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 5. Get 1 booking by Event
const getBookingsForEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const bookings = await Booking.find({ event_id: eventId });
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found for this event' });
        }

        return res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    createBooking,
    deleteBooking,
    updateBookingStatus,
    getOneBooking,
    getBookingsForEvent,
    runConsumer
};
