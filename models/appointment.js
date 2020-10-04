const mongoose = require("mongoose");

const ISchema = {
  username: String,

  user_data: [
    {
      name: String,
      email: String,
      contact: String,
      gender: String,
      hospital: String,
      speciality: String,
      doctor: String,
      date: String,
      no: String,
    },
  ],
};

module.exports = mongoose.model("Appointment", ISchema);
