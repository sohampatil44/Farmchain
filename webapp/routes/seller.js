const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const REGIONS = ["Thane", "Pune", "Nashik", "Aurangabad", "Nagpur", "Kolhapur", "Satara", "Solapur"];
const CATEGORIES = ["Tractor", "Rotavator", "Seeder", "Harvester", "Sprayer", "Tiller", "Baler"];

// Marathi translations for categories
const CATEGORY_TRANSLATIONS = {
    Tractor: "ट्रॅक्टर",
    Rotavator: "रोटाव्हेटर",
    Seeder: "सिडर",
    Harvester: "हार्वेस्टर",
    Sprayer: "स्प्रेयर",
    Tiller: "टिलर",
    Baler: "बेलर"
};

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Seller dashboard - no login/session
router.get("/", async (req, res) => {
    const sellerName = "Seller"; // placeholder
    const sellerId = "seller1";   // placeholder owner id
    const lang = req.query.lang || 'en'; // Default to English

    try {
        const listings = await Listing.find({ owner: sellerId });
        res.render("seller", { 
            sellerName, 
            listings, 
            REGIONS, 
            CATEGORIES, 
            CATEGORY_TRANSLATIONS, 
            lang,
            query: req.query // to preserve filters in forms if needed
        });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Error fetching listings");
    }
});

// Add new listing with file upload
router.post("/add", upload.single("img"), async (req, res) => {
    const { name, category, region, pricePerDay, sellerName } = req.body;
    const sellerId = "seller1"; // placeholder owner id

    if (!name || !category || !region || !pricePerDay || !sellerName) {
        return res.send("All fields except image are required");
    }

    const imgPath = req.file ? "/uploads/" + req.file.filename :
        "https://images.unsplash.com/photo-1602526420402-1e3a07e13420?q=80&w=1600&auto=format&fit=crop";

    try {
        await Listing.create({
            name,
            category,
            region,
            pricePerDay: Number(pricePerDay),
            img: imgPath,
            owner: sellerId,
            sellerName
        });
        // Preserve language selection after redirect
        res.redirect(`/seller?lang=${req.body.lang || 'en'}`);
    } catch (err) {
        console.error("Error creating listing:", err);
        res.status(500).send("Error creating listing");
    }
});

module.exports = router;
