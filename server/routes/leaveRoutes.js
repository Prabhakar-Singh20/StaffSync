const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("Employee"), applyLeave);
router.get("/my-leaves", protect, authorize("Employee"), getMyLeaves);
router.get("/", protect, authorize("HR", "Manager"), getAllLeaves);
router.put("/:id/status", protect, authorize("HR", "Manager"), updateLeaveStatus);

module.exports = router;
