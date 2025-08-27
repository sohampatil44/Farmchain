const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  from: Date,
  to: Date,
  amount: Number,
  status: { type: String, enum: ["reserved","completed"], default: "reserved" },
});
module.exports = mongoose.model("Booking", BookingSchema);
