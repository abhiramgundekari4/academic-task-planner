const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

console.log("Auth routes loaded ✅");

// 🔹 REGISTER

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, course, year, branch } = req.body;

  // 🔥 PASSWORD RULE
  if (password.length < 6) {
    return res.status(400).json({ msg: "Password must be 6+ chars" });
  }

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  user = new User({
    name,
    email,
    password: hashed,
    course,
    year,
    branch,
    attendance: 0
  });

  await user.save();

  const token = jwt.sign({ user: { id: user.id } }, "secret123");

  res.json({ token });
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found ❌");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Wrong password ❌");

    const token = jwt.sign(
      { user: { id: user.id } },
      "secret123",
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).send("Login error");
  }
});

// 🔹 PROFILE (GET)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 🔹 EDIT PROFILE (PUT)
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, course, year, branch, attendance } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, course, year, branch, attendance },
      { new: true }
    ).select("-password");

    res.json(updated);

  } catch (err) {
    res.status(500).send("Update failed");
  }
});

module.exports = router;

// 🔹 GET PROFILE
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Error fetching profile");
  }
});


// 🔹 EDIT PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, course, year, branch, attendance } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, course, year, branch, attendance },
      { new: true }
    ).select("-password");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).send("Error updating profile");
  }
});