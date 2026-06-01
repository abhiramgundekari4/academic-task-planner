const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// add a new task record
router.post("/", auth, async (req, res) => {
  try {
    const { title, type, priority, dueDate, assignedFaculty } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const task = new Task({
      user: req.user.id,
      title,
      type: type ? type.toLowerCase().trim() : "task",
      priority: priority || "medium",
      dueDate: dueDate || null,
      assignedFaculty: assignedFaculty || ""
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Error adding task:", err.message);
    res.status(500).send("Server Error");
  }
});

// get all task records
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).send("Server Error");
  }
});

// delete task record
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    
    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).send("Server Error");
  }
});

// toggle complete status
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Error updating task status:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;