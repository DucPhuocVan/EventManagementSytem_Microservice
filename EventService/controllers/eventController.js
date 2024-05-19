const mongoose = require('mongoose');
const Event = require('../models/eventModel'); // Đường dẫn đến file định nghĩa model Event
const Seat = require('../models/seatModel'); // Đường dẫn đến file định nghĩa model Seat
const Voucher = require('../models/voucherModel'); // Đường dẫn đến file định nghĩa model Voucher
const Feedback = require('../models/feedbackModel'); // Đường dẫn đến file định nghĩa model Feedback
const Producer = require('../config/kafkaConfig.js');
Producer.startProducer()

// 1. Create a new event
const createEvent = async (req, res) => {
    const { event_name, start_date, location, agenda, total_seat, owner_id, seats } = req.body;
    try {
        // Create event
        const newEvent = new Event({
            event_name,
            start_date,
            location,
            agenda,
            total_seat,
            remaining_seat: total_seat,
            owner_id
        });
        await newEvent.save();

        // Setup seats for event
        let seatCounter = 1;
        for (const seatInfo of seats) {
            const { seat_type, quantity, price } = seatInfo;
            for (let i = 0; i < quantity; i++) {
                const seat_code = `${seat_type}${seatCounter}`;
                seatCounter++;
                const seat = new Seat({
                    event_id: newEvent._id,
                    seat_type,
                    seat_code,
                    price,
                    status: 'Available',
                });
                await seat.save();
            }
        }
        res.status(200).json({ message: 'Event and seats created successfully', newEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the event and seats' });
    }
};


// 2. Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Get 1 event
const getOneEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Update an event
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 5. Delete an event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Get seats for an event
const getEventSeats = async (req, res) => {
    try {
        const seats = await Seat.find({ event_id: req.params.id });
        if (!seats.length) {
            return res.status(404).json({ error: 'No seats found for this event' });
        }
        res.status(200).json(seats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Get feedbacks for an event
const getEventFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ event_id: req.params.id });
        if (!feedbacks.length) {
            return res.status(404).json({ error: 'No feedbacks found for this event' });
        }
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Get vouchers for an event
const getEventVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({ event_id: req.params.id });
        if (!vouchers.length) {
            return res.status(404).json({ error: 'No vouchers found for this event' });
        }
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Create booking for an event
const createBooking = async (req, res) => {
    const { event_id, seat_id, user_id, voucher_id } = req.body;

    try {
        // check required
        if (!event_id || !seat_id || !user_id || !voucher_id) {
            return res.status(400).send({ message: 'Missing required fields' });
        }
        // check seat
        const seat = await Seat.findOne({ _id: seat_id});
        if (!seat) {
            return res.status(404).send({ message: 'Seat not found' });
        }

        if (seat.status !== 'active') {
            return res.status(400).send({ message: 'Seat is not available' });
        }
        // check event
        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).send({ message: 'Event not found' });
        }
        // check voucher
        const voucher = await Voucher.findById(voucher_id);
        if (!voucher) {
            return res.status(404).send({ message: 'Voucher not found' });
        }
        if (voucher.remaining_voucher <= 0) {
            return res.status(400).send({ message: 'Voucher is used out' });
        }
        if (voucher.event_id != event_id) {
            return res.status(400).send({ message: 'Voucher does not exist this event' });
        }

        seat.status = 'Booked';
        event.remaining_seat -= 1;
        voucher.remaining_voucher -= 1;
        await seat.save();
        await event.save();
        await voucher.save();

        const booking_details = {
            user_id: user_id,
            event_id: event._id,
            event_name: event.event_name,
            start_date: event.start_date,
            location: event.location,
            agenda: event.agenda,
            seat_id: seat._id,
            seat_type: seat.seat_type,
            seat_code: seat.seat_code,
            price: seat.price,
            voucher_id: voucher_id,
            percent: voucher.percent
        };

        console.log("send message to Kafka");
        await Producer.producer.send({
            topic: 'succeeded',
            messages: [
              { value: JSON.stringify(booking_details) }
            ],
          });

        return res.status(201).json({ message: 'Booking successful', booking_details });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    createEvent,
    getAllEvents,
    getOneEvent,
    updateEvent,
    deleteEvent,
    getEventSeats,
    getEventFeedbacks,
    getEventVouchers,
    createBooking
};

