const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController'); // Adjust the path as necessary

// Route to create a new booking
router.post('/', bookingController.createBooking);

// Route to delete a booking
router.delete('/:bookingId', bookingController.deleteBooking);

// Route to update booking status
router.put('/:bookingId/status', bookingController.updateBookingStatus);

// Route to get a single booking by ID
router.get('/:booking_id', bookingController.getOneBooking);

// Route to get bookings for a specific event
router.get('/event/:eventId', bookingController.getBookingsForEvent);

module.exports = router;
