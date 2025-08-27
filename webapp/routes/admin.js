const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

// Middleware to protect admin routes

// Admin dashboard
router.get("/", async (req, res) => {
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

// Approve a listing
router.post("/approve/:id", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.redirect("/admin");
  } catch (error) {
    console.error("Error approving listing:", error);
    res.status(500).send("Error approving listing");
  }
});

// Decline a listing
router.post("/decline/:id", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { status: "declined" });
    res.redirect("/admin");
  } catch (error) {
    console.error("Error declining listing:", error);
    res.status(500).send("Error declining listing");
  }
});

// Delete a listing
router.post("/delete/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).send("Error deleting listing");
  }
});

// Edit listing - GET form
router.get("/edit/:id", async (req, res) => {
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

// Edit listing - POST update
router.post("/edit/:id", async (req, res) => {
  try {
    const { name, category, region, pricePerDay, img } = req.body;
    await Listing.findByIdAndUpdate(req.params.id, { name, category, region, pricePerDay, img });
    res.redirect("/admin");
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).send("Error updating listing");
  }
});

module.exports = router;
