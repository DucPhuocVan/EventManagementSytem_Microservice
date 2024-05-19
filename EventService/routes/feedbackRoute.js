const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Route để tạo mới một feedback
router.post('/', feedbackController.addFeedback);

// Route để cập nhật thông tin của một feedback
router.put('/:id', feedbackController.updateFeedback);

// Route để xóa một feedback
router.delete('/:id', feedbackController.deleteFeedback);

// Route để lấy tất cả các feedback của một sự kiện
router.get('/:event_id', feedbackController.getAllFeedbacks);

module.exports = router;
