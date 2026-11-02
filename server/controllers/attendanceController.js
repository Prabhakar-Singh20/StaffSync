const Attendance = require("../models/Attendance");

// Helper to normalize date to midnight UTC
const getTodayDate = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private (Employee, Manager, HR)
const checkIn = async (req, res) => {
  try {
    const today = getTodayDate();
    const currentTimeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    let record = await Attendance.findOne({ user: req.user._id, date: today });

    if (record) {
      return res.status(400).json({
        message: "You have already checked in for today",
        record,
      });
    }

    record = await Attendance.create({
      user: req.user._id,
      date: today,
      checkInTime: currentTimeStr,
      status: "Present",
    });

    res.status(201).json({ message: "Check-in successful", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
  try {
    const today = getTodayDate();
    const currentTimeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const record = await Attendance.findOne({ user: req.user._id, date: today });

    if (!record) {
      return res.status(400).json({ message: "You need to check in first before checking out" });
    }

    record.checkOutTime = currentTimeStr;
    await record.save();

    res.json({ message: "Check-out successful", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's attendance records
// @route   GET /api/attendance/my-attendance
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records (HR Attendance Summary)
// @route   GET /api/attendance
// @access  Private (HR)
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name email department")
      .sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
};
