const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  region: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  img: { 
    type: String, 
    default: "https://images.unsplash.com/photo-1602526420402-1e3a07e13420?q=80&w=1600&auto=format&fit=crop" 
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  status: { type: String, default: "pending" }, // pending / approved / declined
  ageInYears: { type: Number, required: true },
  onChainId: { type: Number,default:0 } // 👈 numeric ID for blockchain
}, { timestamps: true });

module.exports = mongoose.model("Listing", ListingSchema);
