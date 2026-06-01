const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String,
  subject: String,
  dueDate: String,
  file: String
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);