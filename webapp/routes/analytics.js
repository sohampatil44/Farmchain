const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { verifyToken } = require("../middleware/auth");

/**
 * FARMER ANALYTICS
 */
router.get("/farmer", verifyToken, async (req, res) => {
  const bookings = await Booking.find({ farmer: req.user.userId })
    .populate("listing");

  let totalSpent = 0;
  let totalDays = 0;
  const usageMap = {};

  bookings.forEach(b => {
    totalSpent += b.amount;
    const days = Math.round((b.to - b.from) / 86400000);
    totalDays += days;

    const name = b.listing?.name || "Unknown";
    usageMap[name] = (usageMap[name] || 0) + days;
  });

  res.render("analytics-farmer", {
    totalSpent,
    totalDays,
    usageMap
  });
});

/**
 * SELLER ANALYTICS
 */
router.get("/seller", verifyToken, async (req, res) => {
  const listings = await Listing.find({ owner: req.user.userId });
  const listingIds = listings.map(l => l._id);

  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing");

  let totalIncome = 0;
  const machineRevenue = {};

  bookings.forEach(b => {
    totalIncome += b.amount;
    const name = b.listing?.name || "Unknown";
    machineRevenue[name] = (machineRevenue[name] || 0) + b.amount;
  });

  res.render("analytics-seller", {
    totalIncome,
    machineRevenue
  });
});

module.exports = router;
