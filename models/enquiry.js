const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  updationDate: {
    type: Date,
  },
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

module.exports = Enquiry;
