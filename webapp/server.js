const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/auth");



const app = express();

// Middleware
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to make session available in EJS
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  



// MongoDB connection
mongoose.connect("mongodb://localhost:27017/farmrent", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));



app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// Landing page
app.get("/", (req, res) => {
    res.render("home");
  });
app.use("/farmer", require("./routes/farmer"));
app.use("/seller", require("./routes/seller"));
app.use("/admin", require("./routes/admin"));

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
