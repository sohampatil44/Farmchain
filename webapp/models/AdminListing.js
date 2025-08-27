const mongoose = require("mongoose");

const AdminListingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true }, // link to original machinery
  status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
  adminComment: { type: String }, // optional comment from admin
}, { timestamps: true });

module.exports = mongoose.model("AdminListing", AdminListingSchema);
