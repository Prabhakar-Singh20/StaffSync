const LeaveRequest = require("../models/LeaveRequest");

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Start date, end date, and reason are required" });
    }

    const leave = await LeaveRequest.create({
      user: req.user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "Pending",
    });

    const populatedLeave = await LeaveRequest.findById(leave._id).populate(
      "user",
      "name email department"
    );

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my-leaves
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email department");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leave requests (Company-wide)
// @route   GET /api/leaves
// @access  Private (HR, Manager)
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email department");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave status (Approve / Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (HR, Manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;

    const updatedLeave = await leave.save();
    const populated = await LeaveRequest.findById(updatedLeave._id).populate(
      "user",
      "name email department"
    );

    res.json(populated);
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
