const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
        res.redirect(`/login/${role}`);
    } catch (err) {
        console.error(err);
        res.send("Error creating account");
    }
});

// Login
router.get("/login/:role", (req, res) => {
    res.render("login", { role: req.params.role ,error:null});
});

router.post("/login/:role", async (req, res) => {
    const { email, password } = req.body;
    const role = req.params.role;

    try {
        let user;

        if (role === "admin") {
            // Hardcoded admin
            if (email === "soham" && password === "123") {
                req.session.userId = "adminId";
                req.session.userName = "Soham";
                req.session.role = "admin";
                return res.redirect("/admin");
            } else return res.send("Invalid admin credentials");
        } else {
            user = await User.findOne({ email, role });
            if (!user) return res.send("User not found");
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.send("Invalid credentials");

            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.role = user.role;

            if (role === "farmer") return res.redirect("/farmer");
            if (role === "seller") return res.redirect("/seller");
        }

    } catch (err) {
        console.error(err);
        res.send("Error logging in");
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;
