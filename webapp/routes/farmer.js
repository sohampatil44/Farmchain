const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { verifyToken, requireFarmer } = require("../middleware/auth");
const fs = require('fs');
const path = require('path');

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

// Ensure orders directory exists
const ordersDir = path.join(__dirname, '../orders');
if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir);
}

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
        let bookings = await Booking.find({ farmer: req.user.userId }).populate({
            path: "listing",
            populate: { path: "owner" }
        });
        
        // 🧹 Remove bookings that have missing listings
        bookings = bookings.filter(b => b.listing !== null);
        

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

router.post('/initiate-booking/:listingId', verifyToken, requireFarmer, async (req, res) => {
    const { days } = req.body;
    const lang = req.query.lang || 'en';

    try {
        const listing = await Listing.findById(req.params.listingId);
        if (!listing) return res.status(404).send('Listing not found');

        const amount = listing.pricePerDay * Math.max(1, Number(days));

        const booking = await Booking.create({
            listing: listing._id,
            farmer: req.user.userId,
            from: new Date(),
            to: new Date(Date.now() + 86400000 * Math.max(1, Number(days))),
            amount,
            status: 'pending'
        });

        res.redirect(`/farmer/payment/${booking._id}?lang=${lang}`);
    } catch (error) {
        console.error('Error initiating booking:', error);
        res.status(500).send('Error initiating booking');
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

router.get('/payment/:bookingId', verifyToken, requireFarmer, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId).populate('listing');
        if (!booking || booking.farmer.toString() !== req.user.userId) return res.status(404).send('Booking not found');

        res.render('payment', {
            bookingId: booking._id,
            listing: {
                ...booking.listing._doc,
                onChainId: booking.listing.onChainId || 0
            },
            days: Math.round((booking.to - booking.from) / 86400000),
            amount: booking.amount
        });
    } catch (error) {
        console.error('Error loading payment:', error);
        res.status(500).send('Error loading payment');
    }
});

router.post('/confirm-booking/:bookingId', verifyToken, requireFarmer, async (req, res) => {
    const { txHash } = req.body;
    try {
        const booking = await Booking.findById(req.params.bookingId).populate('listing');
        if (!booking || booking.farmer.toString() !== req.user.userId) return res.status(404).send('Booking not found');

        booking.status = 'confirmed';
        booking.txHash = txHash;
        await booking.save();

        const farmerId = req.user.userId;
        const orderFile = path.join(ordersDir, `farmer_${farmerId}.json`);

        let orders = [];
        if (fs.existsSync(orderFile)) {
            orders = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
        }

        const newOrder = {
            bookingId: req.params.bookingId,
            txHash,
            amount: booking.amount,
            days: Math.round((booking.to - booking.from) / 86400000),
            listingId: booking.listing.onChainId,
            listingName: booking.listing.name,
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        fs.writeFileSync(orderFile, JSON.stringify(orders, null, 2));

        console.log(`Order saved to ${orderFile}`);

        res.status(200).send('Confirmed');
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).send('Error confirming booking');
    }
});

router.get('/success/:bookingId', verifyToken, requireFarmer, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId).populate('listing');
        if (!booking || booking.farmer.toString() !== req.user.userId || booking.status !== 'confirmed') return res.status(404).send('Booking not found');

        res.render('success', {
            listing: booking.listing,
            days: Math.round((booking.to - booking.from) / 86400000),
            amount: booking.amount,
            txHash: booking.txHash
        });
    } catch (error) {
        console.error('Error loading success:', error);
        res.status(500).send('Error loading success');
    }
});

/**
 * FARMER ANALYTICS
 */
router.get("/analytics", verifyToken, requireFarmer, async (req, res) => {
    const bookings = await Booking.find({
        farmer: req.user.userId,
        status: "confirmed"
    }).populate("listing");

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

module.exports = router;