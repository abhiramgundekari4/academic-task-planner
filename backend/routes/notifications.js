const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.json([
    { msg: "Assignment due tomorrow 📢" },
    { msg: "Attendance low ⚠️" }
  ]);
});

module.exports = router;