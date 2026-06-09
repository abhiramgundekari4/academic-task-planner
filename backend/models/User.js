const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  // 🔥 NEW FIELDS
  course: String,
  year: String,
  branch: String,
  attendance: Number,
  dept: String,
  office: String,
  role: {
    type: String,
    default: "student"
  }
});

module.exports = mongoose.model("User", UserSchema);