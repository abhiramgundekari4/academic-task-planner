const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const auth = require("../middleware/auth");

// add a new teacher
router.post("/", auth, async (req, res) => {
  try {
    const { name, subject, email, cabin } = req.body;
    
    if (!name) {
      return res.status(400).json({ msg: "Faculty name is required" });
    }

    const faculty = new Faculty({
      user: req.user.id,
      name,
      subject: subject || "",
      email: email || "",
      cabin: cabin || ""
    });

    await faculty.save();
    res.json(faculty);
  } catch (err) {
    console.error("Error adding faculty:", err.message);
    res.status(500).send("Server Error");
  }
});

// fetch all saved teachers
router.get("/", auth, async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ name: 1 });
    res.json(faculties);
  } catch (err) {
    console.error("Error fetching faculties:", err.message);
    res.status(500).send("Server Error");
  }
});

// delete teacher record
router.delete("/:id", auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ msg: "Faculty not found" });
    }
    
    if (faculty.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ msg: "Faculty record deleted" });
  } catch (err) {
    console.error("Error deleting faculty:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
