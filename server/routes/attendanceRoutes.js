const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/my-attendance", protect, getMyAttendance);
router.get("/", protect, authorize("HR", "Manager"), getAllAttendance);

module.exports = router;
