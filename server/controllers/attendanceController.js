const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const memoryDb = require("../services/memoryDb");

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

    if (mongoose.connection.readyState === 1) {
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

      return res.status(201).json({ message: "Check-in successful", record });
    }

    // In-memory cloud fallback
    try {
      const record = memoryDb.checkIn(req.user);
      return res.status(201).json({ message: "Check-in successful", record });
    } catch (inErr) {
      return res.status(400).json({ message: inErr.message, record: inErr.record || null });
    }
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

    if (mongoose.connection.readyState === 1) {
      const record = await Attendance.findOne({ user: req.user._id, date: today });

      if (!record) {
        return res.status(400).json({ message: "You need to check in first before checking out" });
      }

      record.checkOutTime = currentTimeStr;
      await record.save();

      return res.json({ message: "Check-out successful", record });
    }

    // In-memory cloud fallback
    try {
      const record = memoryDb.checkOut(req.user);
      return res.json({ message: "Check-out successful", record });
    } catch (outErr) {
      return res.status(400).json({ message: outErr.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's attendance records
// @route   GET /api/attendance/my-attendance
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
      return res.json(records);
    }

    const records = memoryDb.getMyAttendance(req.user._id, req.user.email);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records (HR & Manager Attendance Summary)
// @route   GET /api/attendance
// @access  Private (HR, Manager)
const getAllAttendance = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const records = await Attendance.find()
        .populate("user", "name email department")
        .sort({ date: -1, createdAt: -1 });
      return res.json(records);
    }

    const records = memoryDb.getAllAttendance();
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
