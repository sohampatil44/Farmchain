const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const authRoutes = require("./routes/auth");

const app = express();

// ✅ Add CORS before all routes
app.use(
  cors({
    origin: "http://localhost:3000", // frontend origin
    credentials: true,               // 👈 allow cookies
  })
);

// ✅ Middleware setup (order matters)
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Token verification middleware
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  console.log("===== server middleware =====");
  console.log("Token from cookies:", token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-production");

      if (decoded.role === "admin") {
        res.locals.user = { id: "adminId", name: "alishaikhh15@gmail.com", role: "admin" };
      } else {
        const user = await User.findById(decoded.userId);
        if (user) {
          res.locals.user = { id: user._id, name: user.name, role: user.role };
        }
      }
    } catch (error) {
      console.log("JWT verification failed:", error.message);
      res.clearCookie("token");
    }
  }

  next();
});

// ✅ MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/farmrent", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.render("home");
});

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/farmer", require("./routes/farmer"));
app.use("/seller", require("./routes/seller"));
app.use("/admin", require("./routes/admin"));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
