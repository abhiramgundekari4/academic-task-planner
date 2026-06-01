const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: String,
  code: String,
});

module.exports = mongoose.model("Course", CourseSchema);