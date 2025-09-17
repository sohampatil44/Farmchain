const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  region: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  img: { type: String, default: "https://images.unsplash.com/photo-1602526420402-1e3a07e13420?q=80&w=1600&auto=format&fit=crop" },
  owner: { type: String, required: true }, // seller id
  sellerName: { type: String, required: true },
  ageInYears: { type: Number, required: true }, // New field
  status: { type: String, default: "pending" }, // pending / approved / declined
  createdAt: { type: Date, default: Date.now } // For sorting by creation date
});

module.exports = mongoose.model("Listing", ListingSchema);
