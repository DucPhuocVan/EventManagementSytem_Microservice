const cron = require('node-cron');
const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const { producer } = require('../config/kafkaConfig');

// producer.startProducer()
producer.connect();


// Công việc định kỳ kiểm tra và xoá booking "pending" đã quá 15 phút
const checkStatusBooking = () => {
    cron.schedule('*/10 * * * * *', async () => { // Chạy 10s/1 lần -> update s/1 lần
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 1 * 60 * 1000); // 1 phút expire

        try {
            // Tìm tất cả các booking "pending" đã quá 15 phút
            const expiredBookings = await Booking.find({
                status: 'pending',
                created_date: { $lt: fifteenMinutesAgo }
            });

            if (expiredBookings.length > 0) {
                // In thông tin các booking sẽ bị xoá
                console.log(`Found ${expiredBookings.length} expired bookings at ${now}:`, expiredBookings);
                
                // Send message to Event Service to update event service
                for (const booking of expiredBookings) {
                    const { user_id, event_id, seat_id } = booking;
                    const booking_failed_info = {
                        user_id: user_id,
                        event_id: event_id,
                        seat_id: seat_id
                    };
        
                    console.log(booking_failed_info);
                    console.log("send message expiredBookings to Event Service by topic payment_failed");
        
                    await producer.send({
                        topic: 'payment_failed',
                        messages: [
                            { value: JSON.stringify(booking_failed_info) }
                        ],
                    });
                }

                // Xoá các booking đó
                const result = await Booking.deleteMany({
                    _id: { $in: expiredBookings.map(booking => booking._id) }
                });

                console.log(`Deleted ${result.deletedCount} bookings at ${now}`);
            } else {
                console.log(`No expired bookings found at ${now}`);
            }
        } catch (err) {
            console.error('Error deleting expired bookings:', err);
        }
    });
};

module.exports = {
    checkStatusBooking
};
