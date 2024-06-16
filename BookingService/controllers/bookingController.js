const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const BookingTemp = require('../models/bookingTempModel');
const { producer, consumer, consumer_payment } = require('../config/kafkaConfig');

// producer.startProducer()
producer.connect();


console.log("Starting consumer");

// Consumer data from Event Service to create Booking
consumer.connect();
consumer.subscribe({ topic: 'booking_detail' });

const runConsumer = async () => {
    console.log("Consumer booking_detail running");
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("Consuming Booking detail from Event Service");
            try {
                const bookingData = JSON.parse(message.value.toString());
                console.log("bookingData", bookingData);
                const { status, detail } = bookingData
                if (status === 'success') {
                    console.log("status", status)
                    console.log("detail", detail)
                    await createBooking(detail, status);
                }
                else if (status === 'failed') {
                    console.log("status", status)
                    console.log("detail", detail)
                    await updateBookingTemp(detail, status);
                }
            } catch (error) {
                console.error('Failed to process message', error);
            }
        }
    });
};

// Consumer from Payment to update bookings
consumer_payment.connect();
consumer_payment.subscribe({ topic: 'queued' });

const run_consumer_payment = async () => {
    console.log("Consumer payment running");
    await consumer_payment.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("Consuming Booking service");
            try {
                const booking_id = JSON.parse(message.value.toString());
                console.log(booking_id);
                await updateBookingStatus(booking_id);
            } catch (error) {
                console.error('Failed to process message', error);
            }
        }
    });
};

// Function Create a new Booking
const createBooking = async (bookingData, status_consume) => {
    if (!bookingData) {
        console.error('Received undefined bookingData');
        // return;
    }
    const { user_id, event_id, event_name, start_date, location, agenda, seat_id, seat_type, seat_code, price, voucher_id, percent} = bookingData;
    console.log("status", status_consume);
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

        // Update BookingTemp
        const updatedBookingTemp = await BookingTemp.findOneAndUpdate(
            { user_id, seat_id, voucher_id }, // Điều kiện tìm kiếm
            { status: status_consume, detail: JSON.stringify(bookingData) }, // Cập nhật status và detail
            { new: true }
        );

        if (updatedBookingTemp) {
            console.log('BookingTemp updated:', updatedBookingTemp);
        } else {
            console.log('No BookingTemp found with the provided criteria.');
        }

        // res.status(200).json({ message: 'Booking created successfully', newBooking });
    } catch (error) {
        console.error(error);
        // res.status(500).json({ error: 'An error occurred while creating the event and seats' });
    }
};


// Function update BookingTemp
const updateBookingTemp = async (bookingData, status_consume) => {
    if (!bookingData) {
        console.error('Received undefined bookingData');
        // return;
    }
    const { user_id, seat_id, voucher_id, error} = bookingData;

    try {
        // Update BookingTemp
        const updatedBookingTemp = await BookingTemp.findOneAndUpdate(
            { user_id, seat_id, voucher_id }, // Điều kiện tìm kiếm
            { status: status_consume, detail: error }, // Cập nhật status và detail
            { new: true }
        );

        if (updatedBookingTemp) {
            console.log('BookingTemp updated:', updatedBookingTemp);
        } else {
            console.log('No BookingTemp found with the provided criteria.');
        }

        // res.status(200).json({ message: 'Booking created successfully', newBooking });
    } catch (error) {
        console.error(error);
        // res.status(500).json({ error: 'An error occurred while creating the event and seats' });
    }
};

// 1. Create booking for an event
const requestBooking = async (req, res) => {
    console.log(req.body);
    const { seat_id, user_id, voucher_id } = req.body;

    try {
        // check required
        if (!seat_id || !user_id || !voucher_id) {
            return res.status(400).send({ message: 'Missing required fields' });
        }

        // insert bookingTemp
        const newBookingTemp = new BookingTemp({
            user_id: user_id,
            seat_id: seat_id,
            voucher_id: voucher_id
        });
        await newBookingTemp.save();
        console.log("newBookingTemp", newBookingTemp);
        
        // send message booking_info to topic check_seat
        const booking_info = {
            user_id: user_id,
            seat_id: seat_id,
            voucher_id: voucher_id
        };
        console.log(booking_info)

        console.log("send message booking_info to topic check_seat");
        await producer.send({
            topic: 'check_seat',
            messages: [
              { value: JSON.stringify(booking_info) }
            ],
          });

        console.log("booking_info", booking_info);
        return res.status(201).json({ message: 'Booking is being processed', newBookingTemp});
    }
    catch (error) {
        res.status(500).json({ error: error.message });
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
const updateBookingStatus = async (booking_id) => {

    console.log("booking_id", booking_id)
    try {
        const booking = await Booking.findById(booking_id);
        if (!booking) {
        //     return res.status(404).json({ message: 'Booking not found' });
            console.error(`Booking with ID ${booking_id} not found`);
        }
        console.log("booking", booking)
        booking.status = "Completed";
        await booking.save();

        // return res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error(error);
        // return res.status(500).json({ message: 'Server error' });
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

// 6. Get all bookings temp
const getAllBookingTemp = async (req, res) => {
    try {
        const booking_temp = await BookingTemp.find();
        res.status(200).json(booking_temp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createBooking,
    deleteBooking,
    getOneBooking,
    getBookingsForEvent,
    runConsumer,
    run_consumer_payment,
    requestBooking,
    getAllBookingTemp
};
