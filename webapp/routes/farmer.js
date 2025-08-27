const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");


const REGIONS = ["Thane", "Pune", "Nashik", "Aurangabad", "Nagpur", "Kolhapur", "Satara", "Solapur"];
const CATEGORIES = ["Tractor", "Rotavator", "Seeder", "Harvester", "Sprayer", "Tiller", "Baler"];
const CATEGORY_TRANSLATIONS = {
    'Tractor': 'ट्रॅक्टर',
    'Rotavator': 'रोटावेटर',
    'Seeder': 'सीडर',
    'Harvester': 'हार्वेस्टर',
    'Sprayer': 'स्प्रेयर',
    'Tiller': 'टिलर',
    'Baler': 'बेलर'
  };

// Farmer dashboard - no login/session required
router.get("/", async (req, res) => {
    const farmerName = "Farmer"; // placeholder name

    const region = req.query.region ? req.query.region.trim() : "";
    const category = req.query.category ? req.query.category.trim() : "";
    const query = req.query.q ? req.query.q.trim() : "";
    const lang = req.query.lang || 'en'; // Default to English



    // Build filter for listings
    let filter = { status: "approved" };
    if (region) filter.region = { $regex: new RegExp(`^${region}`, "i") };
    if (category && category !== "all") filter.category = { $regex: new RegExp(`^${category}`, "i") };
    if (query) filter.name = { $regex: query, $options: "i" };

    try {
        const listings = await Listing.find(filter).populate("owner");

        // Skip fetching bookings since we don't have farmerId
        const bookings = [];

        res.render("farmer", {
            farmerName,
            listings,
            bookings,
            REGIONS,
            CATEGORIES,
            region,
            category: category || "all",
            query,
            lang,
            CATEGORY_TRANSLATIONS
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Error fetching listings");
    }
});

// Booking a listing - no session/farmerId needed
router.post("/book/:listingId", async (req, res) => {
    const { days } = req.body;
    const lang = req.query.lang || 'en'; // preserve language


    try {
        const listing = await Listing.findById(req.params.listingId);
        if (!listing) return res.status(404).send("Listing not found");

        const amount = listing.pricePerDay * Math.max(1, Number(days));

        await Booking.create({
            listing: listing._id,
            farmer: "anonymous", // placeholder
            from: new Date(),
            to: new Date(Date.now() + 86400000 * Math.max(1, Number(days))),
            amount,
        });

        res.redirect(`/farmer?lang=${lang}`); // preserve selected language
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send("Error creating booking");
    }
});

// Debug route
router.get("/debug", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        const uniqueRegions = [...new Set(allListings.map(l => l.region))];
        const uniqueCategories = [...new Set(allListings.map(l => l.category))];
        const uniqueStatuses = [...new Set(allListings.map(l => l.status))];

        res.json({
            totalListings: allListings.length,
            uniqueRegions,
            uniqueCategories,
            uniqueStatuses,
            sampleListings: allListings.slice(0, 5).map(l => ({
                name: l.name,
                region: l.region,
                category: l.category,
                status: l.status
            }))
        });
    } catch (error) {
        console.error("Debug error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
