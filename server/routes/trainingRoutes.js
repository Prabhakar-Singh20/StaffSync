const express = require("express");
const router = express.Router();
const {
  getTrainings,
  createTraining,
  deleteTraining,
} = require("../controllers/trainingController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getTrainings)
  .post(protect, authorize("Manager"), createTraining);

router
  .route("/:id")
  .delete(protect, authorize("Manager"), deleteTraining);

module.exports = router;
