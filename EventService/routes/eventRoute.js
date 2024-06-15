const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

const handle = fn => {
    return (req, res, next) => fn(req, res, next).catch(next);
}

// Route để tạo mới một sự kiện
router.post('/', handle(eventController.createEvent));

// Route để lấy tất cả các sự kiện
router.get('/', handle(eventController.getAllEvents));

// Route để lấy thông tin của một sự kiện dựa trên ID
router.get('/:id', handle(eventController.getOneEvent));

// Route để cập nhật thông tin của một sự kiện dựa trên ID
router.put('/:id', handle(eventController.updateEvent));

// Route để xóa một sự kiện dựa trên ID
router.delete('/:id', handle(eventController.deleteEvent));

// Route để lấy tất cả các ghế của một sự kiện
router.get('/:id/seats', handle(eventController.getEventSeats));

// Route để lấy tất cả các feedback của một sự kiện
router.get('/:id/feedbacks', handle(eventController.getEventFeedbacks));

// Route để lấy tất cả các voucher của một sự kiện
router.get('/:id/vouchers', handle(eventController.getEventVouchers));

module.exports = router;
