const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protectUser = require("../middleware/protectUser");
const rateLimit = require("express-rate-limit");

const router = express.Router();


const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Try again after 1 minute." }
});


router.post("/register", async (req, res) => {
  try {
    let { name, phone, password } = req.body;

   
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = name.trim();
    phone = phone.replace(/\s+/g, "");

   
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

   
    const exist = await User.findOne({ phone });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await User.create({
      name,
      phone,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { phone, password } = req.body;

    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});




router.get("/status-check", protectUser, async (req, res) => {
  try {
    res.json({ status: "User authenticated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;