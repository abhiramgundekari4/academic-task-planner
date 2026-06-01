const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// get user profile details
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// get all students/users list (for admin dropdown)
router.get("/students", auth, async (req, res) => {
  try {
    const students = await User.find().select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// update own profile data
router.put("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.course !== undefined) user.course = req.body.course;
    if (req.body.year !== undefined) user.year = req.body.year;
    if (req.body.branch !== undefined) user.branch = req.body.branch;
    if (req.body.attendance !== undefined) user.attendance = Number(req.body.attendance);

    await user.save();
    res.json(user);

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// update a specific student's profile (for admin)
router.put("/student/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Student not found" });
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.course !== undefined) user.course = req.body.course;
    if (req.body.year !== undefined) user.year = req.body.year;
    if (req.body.branch !== undefined) user.branch = req.body.branch;
    if (req.body.attendance !== undefined) user.attendance = Number(req.body.attendance);

    await user.save();
    res.json(user);

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;