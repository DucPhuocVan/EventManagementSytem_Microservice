const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Route để tạo mới một voucher
router.post('/', voucherController.addVoucher);

// Route để lấy tất cả các voucher của một sự kiện
router.get('/:event_id', voucherController.getVoucherByEvent);

// Route để cập nhật số lượng voucher còn lại
router.put('/', voucherController.updateVoucher);

module.exports = router;
