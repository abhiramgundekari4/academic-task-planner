const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.put("/update", auth, async (req, res) => {
  const { name, email, course, year, branch, attendance } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, course, year, branch, attendance },
    { new: true }
  );

  res.json(user);
});