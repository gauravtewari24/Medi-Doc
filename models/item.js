const mongoose = require("mongoose");

const ISchema = {
	first_name: String,
	last_name: String,
	email: String,
	password: String,
	c_password: String,
	phone: String,
	gender: String,
	h_i_s: String,
	age: String,
	Uid: String,
	notifications:[
		{
			date: String,
			details: String,
		}
	],
	user_stat:
		{
			blood_oxy: String,
			blood_press: String,
			sugar: String,
		},
	user_data: [
		{
			pdf_no: String,
			date: String,
			report: String,
			result: String,
			update: String,
		},
	],
};

module.exports = mongoose.model("Item", ISchema);
