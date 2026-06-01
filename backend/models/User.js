const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  // 🔥 NEW FIELDS
  course: String,
  year: String,
  branch: String,
  attendance: Number
});

module.exports = mongoose.model("User", UserSchema);