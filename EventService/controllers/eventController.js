const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Event = require('../models/eventModel'); // Đường dẫn đến file định nghĩa model Event
const Seat = require('../models/seatModel'); // Đường dẫn đến file định nghĩa model Seat
const Voucher = require('../models/voucherModel'); // Đường dẫn đến file định nghĩa model Voucher
const Feedback = require('../models/feedbackModel'); // Đường dẫn đến file định nghĩa model Feedback
const { producer, consumer_payment, consumer_booking_info } = require('../config/kafkaConfig.js');

// producer.startProducer()
producer.connect();

// Consumer data from payment
consumer_payment.connect();
consumer_payment.subscribe({ topic: 'failed' });

const runConsumer = async () => {
    console.log("Consumer event for payment failed running");
    await consumer_payment.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("Consuming event for payment failed");
            try {
                const event_data = JSON.parse(message.value.toString());
                console.log(event_data);
                await updateSeatEvent(event_data);
            } catch (error) {
                console.error('Failed to process message', error);
            }
        }
    });
};

// Consumer booking_infor from booking
consumer_booking_info.connect();
consumer_booking_info.subscribe({ topic: 'check_seat' });

const runConsumerBookingInfo = async () => {
    console.log("Consumer booking info from Booking by topic check_seat");
    await consumer_booking_info.run({
        eachMessage: async ({ message }) => {
            console.log("Consuming booking info from Booking by topic check_seat");
            try {
                const booking_info = JSON.parse(message.value.toString());
                console.log(booking_info);
                await checkInfoBooking(booking_info);
            } catch (error) {
                console.error('Failed to process message', error);
            }
        }
    });
};


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

// 9. check booking infor for an event
const checkInfoBooking = async (booking_infor) => {
    const { seat_id, user_id, voucher_id } = booking_infor;
    console.log(seat_id, user_id, voucher_id);
    try {
        let message = 'ready'
        // check seat
        const seat = await Seat.findOne({ _id: seat_id});
        console.log("seat", seat);

        console.log("seat.event_id", seat.event_id.toString())
        const event = await Event.findById(seat.event_id.toString());
        console.log("event", event)

        
        if (!seat) {
            // return res.status(404).send({ message: 'Seat not found' });
            message = 'No seat found for this event'
            console.log(message)
        }

        if (seat.status !== 'Available') {
            // return res.status(400).send({ message: 'Seat is not available' });
            message = 'Seat is not available'
            console.log(message)
        }

        // check voucher
        const voucher = await Voucher.findById(voucher_id);
        if (!voucher) {
            // return res.status(404).send({ message: 'Voucher not found' });
            message = 'Voucher not found'
            console.log(message)
        }
        if (voucher.remaining_voucher <= 0) {
            // return res.status(400).send({ message: 'Voucher is used out' });
            message = 'Voucher is used out'
            console.log(message)
        }
        if (voucher.event_id != event_id) {
            // return res.status(400).send({ message: 'Voucher does not exist this event' });
            message = 'Voucher does not exist this event'
            console.log(message)
        }

        // Get event from seat
        // if (seat.event_id.match(/^[0-9a-fA-F]{24}$/)) {
        //     const event = await Event.findById(seat.event_id.match(/^[0-9a-fA-F]{24}$/));
        //     console.log("event", event)
        // }
        // const event = await Event.findById(seat.event_id.match(/^[0-9a-fA-F]{24}$/));
        // console.log("seat.event_id", seat.event_id.toString())
        // const event = await Event.findById(seat.event_id.toString());
        // console.log("event", event)
        if (!event) {
            // return res.status(404).send({ message: 'Event not found' });
            message = 'Event not found'
            console.log(message)
        }
        if (event.remaining_seat <= 0) {
            // return res.status(400).send({ message: 'Event is full' });
            message = 'Event is full'
            console.log(message)
        }

        if (message == 'ready')
        {
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

            console.log("Send message booking_detail from Event to Booking by topic booking_detail");
            await producer.send({
                topic: 'booking_detail',
                messages: [
                    { value: JSON.stringify(booking_details) }
                ],
            });

            console.log("booking_details", booking_details);
        }
        else {
            console.log(message);
        }
    }
    catch (error) {
        console.error(error);
        // res.status(500).json({ error: error.message });
    }
};

// 10. Update seat status and seat remaining for event
const updateSeatEvent = async (event_data) => {
    console.log("event_data", event_data)
    const { event_id, seat_id} = event_data;
    console.log("event_id", event_id)
    console.log("seat_id", seat_id)
    try {
        const event = await Event.findById(event_id);
        if (!event) {
        //     return res.status(404).json({ message: 'Booking not found' });
            console.error(`Event with ID ${event} not found`);
        }
        const seat = await Seat.findById(seat_id);
        if (!seat) {
        //     return res.status(404).json({ message: 'Booking not found' });
            console.error(`Seat with ID ${seat} not found`);
        }
        seat.status = "Available";
        await seat.save();
        event.remaining_seat += 1;
        await event.save();
        console.log("event", event)
        console.log("seat", seat)
        // return res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error(error);
        // return res.status(500).json({ message: 'Server error' });
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
    checkInfoBooking,
    runConsumer,
    runConsumerBookingInfo
};

