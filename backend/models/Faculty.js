const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  cabin: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Faculty", FacultySchema);
