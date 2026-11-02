const express = require("express");
const router = express.Router();
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("HR", "Manager"), getEmployees)
  .post(protect, authorize("HR"), createEmployee);

router
  .route("/:id")
  .put(protect, authorize("HR"), updateEmployee)
  .delete(protect, authorize("HR"), deleteEmployee);

module.exports = router;
