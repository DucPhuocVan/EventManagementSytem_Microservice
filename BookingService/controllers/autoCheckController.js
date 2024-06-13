const cron = require('node-cron');
const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');

// Công việc định kỳ kiểm tra và xoá booking "pending" đã quá 15 phút
const checkStatusBooking = () => {
    cron.schedule('* * * * *', async () => { // Chạy mỗi phút
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

        try {
            // Tìm tất cả các booking "pending" đã quá 15 phút
            const expiredBookings = await Booking.find({
                status: 'pending',
                created_date: { $lt: fifteenMinutesAgo }
            });

            if (expiredBookings.length > 0) {
                // In thông tin các booking sẽ bị xoá
                console.log(`Found ${expiredBookings.length} expired bookings at ${now}:`, expiredBookings);

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
