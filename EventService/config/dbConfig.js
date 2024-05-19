const mongoose = require("mongoose");

module.exports = () => {
	try {
		mongoose.connect('mongodb+srv://alivebook:phuoc123@cluster0.yc15ozu.mongodb.net/event?retryWrites=true&w=majority');
		console.log("Connected to database successfully");
	} catch (error) {
		console.log(error);
		console.log("Could not connect database!");
	}
};