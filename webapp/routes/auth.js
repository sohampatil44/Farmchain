const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middleware/auth");

// Signup (only for farmer & seller)
router.get("/signup/:role", (req, res) => {
    const role = req.params.role;
    if (role === "admin") return res.send("Admin signup not allowed");
    res.render("signup", { role });
});

router.post("/signup/:role", async (req, res) => {
    const { name, email, password } = req.body;
    const role = req.params.role;
    if (!name || !email || !password) return res.send("All fields required");

    try {
        const user = new User({ name, email, password, role });
        await user.save();
        res.redirect(`/auth/login/${role}`);
    } catch (err) {
        console.error(err);
        res.send("Error creating account");
    }
});

// Login
router.get("/login/:role", (req, res) => {
    res.render("login", { role: req.params.role, error: null });
});

router.post("/login/:role", async (req, res) => {
    const { email, password } = req.body;
    const role = req.params.role;

    try {
        let user;

        if (role === "admin") {
            if (email === "alishaikhh15@gmail.com" && password === "123") {
                const token = generateToken("adminId", "admin");
                res.cookie('token', token, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000 
                });
                return res.redirect("/admin");
            } else {
                return res.render("login", { role, error: "Invalid admin credentials" });
            }
        } else {
            user = await User.findOne({ email, role });
            if (!user) {
                return res.render("login", { role, error: "User not found" });
            }
            
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.render("login", { role, error: "Invalid credentials" });
            }

            const token = generateToken(user._id.toString(), user.role);
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 
            });

            if (role === "farmer") return res.redirect("/farmer");
            if (role === "seller") return res.redirect("/seller");
        }

    } catch (err) {
        console.error(err);
        res.render("login", { role, error: "Error logging in" });
    }
});

// Logout
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/");
});

module.exports = router;
