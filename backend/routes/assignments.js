const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Assignment = require("../models/Assignment");
const multer = require("multer");

// 📁 STORAGE
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 🔹 CREATE (WITH PDF)
router.post("/", auth, upload.single("file"), async (req, res) => {
  const { title, subject, dueDate } = req.body;

  const assignment = new Assignment({
    user: req.user.id,
    title,
    subject,
    dueDate,
    file: req.file ? req.file.filename : null
  });

  const saved = await assignment.save();
  res.json(saved);
});

// 🔹 GET
router.get("/", auth, async (req, res) => {
  const data = await Assignment.find({ user: req.user.id });
  res.json(data);
});

module.exports = router;
router.post("/", async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.json(newAssignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});