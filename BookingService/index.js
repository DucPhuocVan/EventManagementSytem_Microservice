const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/dbConfig");

const bookingController = require('./controllers/bookingController')

bookingController.runConsumer()
bookingController.run_consumer_payment()

// middlewares
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Import routes
const bookingRoute = require('./routes/bookingRoute');

// Sử dụng các route
app.use('/booking', bookingRoute);

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

const port = 8001;
app.listen(port, console.log(`Listening on port ${port}...`));