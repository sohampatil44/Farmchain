const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { verifyToken, requireFarmer } = require("../middleware/auth");

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

router.get("/", verifyToken, requireFarmer, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/auth/login/farmer');
        }

        const farmerName = user.name;
        const region = req.query.region ? req.query.region.trim() : "";
        const category = req.query.category ? req.query.category.trim() : "";
        const query = req.query.q ? req.query.q.trim() : "";
        const lang = req.query.lang || 'en';

        let filter = { status: "approved" };
        if (region) filter.region = { $regex: new RegExp(`^${region}`, "i") };
        if (category && category !== "all") filter.category = { $regex: new RegExp(`^${category}`, "i") };
        if (query) filter.name = { $regex: query, $options: "i" };

        const listings = await Listing.find(filter).populate("owner");
        const bookings = await Booking.find({ farmer: req.user.userId }).populate("listing");

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

router.post("/book/:listingId", verifyToken, requireFarmer, async (req, res) => {
    const { days } = req.body;
    const lang = req.query.lang || 'en';

    try {
        const listing = await Listing.findById(req.params.listingId);
        if (!listing) return res.status(404).send("Listing not found");

        const amount = listing.pricePerDay * Math.max(1, Number(days));

        await Booking.create({
            listing: listing._id,
            farmer: req.user.userId,
            from: new Date(),
            to: new Date(Date.now() + 86400000 * Math.max(1, Number(days))),
            amount,
        });

        res.redirect(`/farmer?lang=${lang}`);
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send("Error creating booking");
    }
});

router.get("/debug", verifyToken, requireFarmer, async (req, res) => {
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
