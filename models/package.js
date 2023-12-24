const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
  },
  packageType: {
    type: String,
    required: true,
  },
  packageLocation: {
    type: String,
    required: true,
  },
  packagePrice: {
    type: Number,
    required: true,
  },
  packageFeatures: [
    {
      type: String,
    },
  ],
  packageDetails: {
    type: String,
    required: true,
  },
  packageImage: {
    type: String,
  },
  tags: [
    {
      type: String,
    },
  ],
  days: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  bookings: {
    type: Number,
  },
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
