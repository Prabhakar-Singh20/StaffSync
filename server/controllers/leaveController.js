const mongoose = require("mongoose");
const LeaveRequest = require("../models/LeaveRequest");
const memoryDb = require("../services/memoryDb");

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private (All authenticated roles)
const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Start date, end date, and reason are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const leave = await LeaveRequest.create({
        user: req.user._id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "Pending",
      });

      const populatedLeave = await LeaveRequest.findById(leave._id)
        .populate("user", "name email department role");

      return res.status(201).json(populatedLeave);
    }

    // In-memory cloud fallback
    const leave = memoryDb.createLeave({ startDate, endDate, reason }, req.user);
    return res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const leaves = await LeaveRequest.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate("user", "name email department role")
        .populate("reviewedBy", "name role");
      return res.json(leaves);
    }

    const leaves = memoryDb.getMyLeaves(req.user._id, req.user.email);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leave requests (Company-wide: visible to both HR and Manager)
// @route   GET /api/leaves
// @access  Private (HR, Manager)
const getAllLeaves = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const leaves = await LeaveRequest.find()
        .sort({ createdAt: -1 })
        .populate("user", "name email department role")
        .populate("reviewedBy", "name role");
      return res.json(leaves);
    }

    const leaves = memoryDb.getAllLeaves();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave status (Approve / Reject: accessible by both HR and Manager)
// @route   PUT /api/leaves/:id/status
// @access  Private (HR, Manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (mongoose.connection.readyState === 1) {
      const leave = await LeaveRequest.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      leave.status = status;
      leave.reviewedBy = req.user._id;

      const updatedLeave = await leave.save();
      const populated = await LeaveRequest.findById(updatedLeave._id)
        .populate("user", "name email department role")
        .populate("reviewedBy", "name role");

      return res.json(populated);
    }

    // In-memory cloud fallback
    const updated = memoryDb.updateLeaveStatus(req.params.id, status, req.user);
    if (!updated) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
