const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.ObjectId,
    required: true,
  },
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  bookingMail: {
    type: String,
  },
  bookingMobile: {
    type: String,
  },
  bookedtime: {
    type: Date,
    required: true,
  },
  bookingRemarks: {
    type: String,
  },
  passengers: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
