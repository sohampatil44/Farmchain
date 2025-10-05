const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const AdminListing = require("../models/AdminListing");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// GET /admin - show all listings
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pending = await Listing.find({ status: "pending" }).populate("owner");
    const approved = await Listing.find({ status: "approved" }).populate("owner");
    const declined = await Listing.find({ status: "declined" }).populate("owner");

    res.render("admin", { pending, approved, declined });
  } catch (error) {
    console.error("Error fetching admin listings:", error);
    res.status(500).send("Error fetching admin listings");
  }
});

// POST /admin/approve/:id
router.post("/approve/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!listing) return res.status(404).send("Listing not found");

    // Update AdminListing if exists
    await AdminListing.updateMany(
      { listing: mongoose.Types.ObjectId(req.params.id) },
      { status: "approved" }
    );

    console.log("Approved listing:", listing);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error approving listing:", error);
    res.status(500).send("Error approving listing");
  }
});

// POST /admin/decline/:id
router.post("/decline/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "declined" }, { new: true });
    if (!listing) return res.status(404).send("Listing not found");

    // Update AdminListing if exists
    await AdminListing.updateMany(
      { listing: mongoose.Types.ObjectId(req.params.id) },
      { status: "declined" }
    );

    console.log("Declined listing:", listing);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error declining listing:", error);
    res.status(500).send("Error declining listing");
  }
});

// POST /admin/delete/:id
router.post("/delete/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const listingId = req.params.id;
    console.log("Attempting to delete listing with ID:", listingId);

    // Find listing first
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send("Listing not found");

    console.log("Found listing to delete:", {
      id: listing._id,
      name: listing.name,
      owner: listing.owner,
      sellerName: listing.sellerName
    });

    // Delete Listing
    const result = await Listing.findByIdAndDelete(listingId);

    // Delete associated AdminListing entries
    await AdminListing.deleteMany({ listing: mongoose.Types.ObjectId(listingId) });
    console.log("Deleted associated AdminListing entries for:", listingId);

    if (result) {
      if (req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, message: "Listing deleted successfully" });
      }
     
    } else {
      res.status(404).send("Listing not found");
    }
  } catch (error) {
    console.error("Error deleting listing:", error);
    if (req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: "Error deleting listing" });
    }
    res.status(500).send("Error deleting listing");
  }
});

// GET /admin/edit/:id
router.get("/edit/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");

    res.render("editListing", {
      listing,
      REGIONS: ["Thane","Pune","Nashik","Aurangabad","Nagpur","Kolhapur","Satara","Solapur"],
      CATEGORIES: ["Tractor","Rotavator","Seeder","Harvester","Sprayer","Tiller","Baler"]
    });
  } catch (error) {
    console.error("Error fetching listing for edit:", error);
    res.status(500).send("Error fetching listing");
  }
});

// POST /admin/edit/:id
router.post("/edit/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, region, pricePerDay, img } = req.body;
    const result = await Listing.findByIdAndUpdate(
      req.params.id,
      { name, category, region, pricePerDay, img },
      { new: true }
    );
    if (!result) return res.status(404).send("Listing not found");

    console.log("Updated listing:", result);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).send("Error updating listing");
  }
});

module.exports = router;
