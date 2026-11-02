const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Training title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Training description is required"],
  },
  trainer: {
    type: String,
    required: [true, "Trainer name is required"],
  },
  date: {
    type: Date,
    required: [true, "Training date is required"],
  },
  targetDepartment: {
    type: String,
    default: "All",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Training", trainingSchema);
