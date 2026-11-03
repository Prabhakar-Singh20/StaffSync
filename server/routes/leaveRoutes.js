const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/auth");

// Any authenticated employee, manager, or HR can submit and view their own leaves
router.post("/", protect, applyLeave);
router.get("/my-leaves", protect, getMyLeaves);

// Both HR and Manager can view all company leaves and approve/reject them
router.get("/", protect, authorize("HR", "Manager"), getAllLeaves);
router.put("/:id/status", protect, authorize("HR", "Manager"), updateLeaveStatus);

module.exports = router;
