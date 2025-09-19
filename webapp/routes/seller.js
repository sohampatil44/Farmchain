const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken, requireSeller } = require("../middleware/auth");
const { spawn } = require("child_process");

// -------------------------------
// Constants
// -------------------------------
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

// -------------------------------
// Ensure uploads folder exists
// -------------------------------
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// -------------------------------
// Multer storage configuration
// -------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// -------------------------------
// Seller Dashboard
// -------------------------------
router.get("/", verifyToken, requireSeller, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/auth/login/seller');
        }

        const sellerName = user.name;
        const sellerId = req.user.userId;
        const lang = req.query.lang || 'en';

        const listings = await Listing.find({ owner: sellerId }).sort({ createdAt: -1 });

        res.render("seller", { 
            sellerName,
            listings,
            REGIONS,
            CATEGORIES,
            CATEGORY_TRANSLATIONS,
            lang,
            query: req.query
        });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Error fetching listings");
    }
});

// -------------------------------
// Add new listing with auto-approval
// -------------------------------
router.post("/add", verifyToken, requireSeller, upload.single("img"), async (req, res) => {
    const { name, category, region, pricePerDay, sellerName, ageInYears } = req.body;
    const sellerId = req.user.userId;

    if (!name || !category || !region || !pricePerDay || !sellerName || !ageInYears) {
        return res.send("All fields except image are required");
    }

    const imgPath = req.file
        ? "/uploads/" + req.file.filename
        : "https://images.unsplash.com/photo-1602526420402-1e3a07e13420?q=80&w=1600&auto=format&fit=crop";

    try {
        const status = Number(ageInYears) <= 5 ? "approved" : "pending";

        await Listing.create({
            name,
            category,
            region,
            pricePerDay: Number(pricePerDay),
            img: imgPath,
            owner: sellerId,
            sellerName,
            ageInYears: Number(ageInYears),
            status,
            createdAt: new Date()
        });

        res.redirect(`/seller?lang=${req.body.lang || 'en'}`);
    } catch (err) {
        console.error("Error creating listing:", err);
        res.status(500).send("Error creating listing");
    }
});

// -------------------------------
// Live price validation using Python
// -------------------------------
router.post("/validate-price", (req, res) => {
    const { equipment, price } = req.body;

    // Absolute path to Python script
    const pyPath = path.join(__dirname, "../validate_price.py");

    const py = spawn("/opt/homebrew/Caskroom/miniforge/base/bin/python3", [pyPath, equipment, price]);

    let result = "";
    py.stdout.on("data", data => result += data.toString());
    py.stderr.on("data", data => console.error("Python error:", data.toString()));

    py.on("close", () => {
        try {
            // Parse result from Python
            const response = JSON.parse(result);
            res.json(response);
        } catch (err) {
            console.error("Error parsing validator output:", err, "Raw output:", result);
            res.json({ valid: false, message: "Validation error" });
        }
    });
});

module.exports = router;
