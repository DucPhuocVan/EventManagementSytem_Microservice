const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Route để lấy tất cả các ghế của một sự kiện
router.get('/:event_id', seatController.getAllSeats);

// Route để cập nhật trạng thái của một ghế
router.put('/:seat_id', seatController.updateSeat);

module.exports = router;
