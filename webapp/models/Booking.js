const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed'] },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);