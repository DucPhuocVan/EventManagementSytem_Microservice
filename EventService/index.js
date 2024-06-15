const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const eventController = require('./controllers/eventController')

// auto running consumer
eventController.runConsumer()
eventController.runConsumerBookingInfo()

// middlewares
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Import các route
const eventRoute = require('./routes/eventRoute');
const feedbackRoute = require('./routes/feedbackRoute');
const seatRoute = require('./routes/seatRoute');
const voucherRoute = require('./routes/voucherRoute');

// Sử dụng các route
app.use('/event', eventRoute);
app.use('/feedback', feedbackRoute);
app.use('/seat', seatRoute);
app.use('/voucher', voucherRoute);

app.use((req, res, next) => {
    const error = new Error("not found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    return res.status(status).json({ message})
})

const port = 8000;
app.listen(port, console.log(`Listening on port ${port}...`));