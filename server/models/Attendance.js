const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: String,
  },
  checkOutTime: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Half Day"],
    default: "Present",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
