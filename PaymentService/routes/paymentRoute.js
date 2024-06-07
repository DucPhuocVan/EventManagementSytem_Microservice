const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const handle = fn => {
    return (req, res, next) => fn(req, res, next).catch(next);
}

router.post('/create_payment_url', handle(paymentController.create_payment_url));

router.get('/vnpay_return', handle(paymentController.vnpay_return));

router.get('/vnpay_ipn', handle(paymentController.vnpay_ipn));

router.post('/querydr', handle(paymentController.querydr));

router.post('/refund', handle(paymentController.refund));

module.exports = router;