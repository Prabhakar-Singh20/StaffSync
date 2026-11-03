const mongoose = require("mongoose");
const Training = require("../models/Training");
const memoryDb = require("../services/memoryDb");

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private (All authenticated users)
const getTrainings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const trainings = await Training.find().sort({ date: 1 });
      return res.json(trainings);
    }

    const trainings = memoryDb.getAllTrainings();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new training program
// @route   POST /api/trainings
// @access  Private (Manager)
const createTraining = async (req, res) => {
  try {
    const { title, description, trainer, date, targetDepartment } = req.body;

    if (!title || !description || !trainer || !date) {
      return res.status(400).json({ message: "Please fill in all training fields" });
    }

    if (mongoose.connection.readyState === 1) {
      const training = await Training.create({
        title,
        description,
        trainer,
        date: new Date(date),
        targetDepartment: targetDepartment || "All",
        createdBy: req.user._id,
      });

      return res.status(201).json(training);
    }

    const training = memoryDb.createTraining({
      title,
      description,
      trainer,
      date,
      targetDepartment,
    });
    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private (Manager)
const deleteTraining = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const training = await Training.findById(req.params.id);

      if (!training) {
        return res.status(404).json({ message: "Training not found" });
      }

      await Training.findByIdAndDelete(req.params.id);
      return res.json({ message: "Training session deleted successfully" });
    }

    memoryDb.deleteTraining(req.params.id);
    res.json({ message: "Training session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrainings,
  createTraining,
  deleteTraining,
};
