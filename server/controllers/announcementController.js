const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const memoryDb = require("../services/memoryDb");

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated users)
const getAnnouncements = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const announcements = await Announcement.find()
        .populate("postedBy", "name role")
        .sort({ createdAt: -1 });
      return res.json(announcements);
    }

    const announcements = memoryDb.getAllAnnouncements();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (HR, Manager)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const announcement = await Announcement.create({
        title,
        message,
        postedBy: req.user._id,
        targetRole: targetRole || "All",
      });

      const populated = await Announcement.findById(announcement._id).populate(
        "postedBy",
        "name role"
      );

      return res.status(201).json(populated);
    }

    const announcement = memoryDb.createAnnouncement({ title, message, targetRole }, req.user);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR, Manager)
const deleteAnnouncement = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      await Announcement.findByIdAndDelete(req.params.id);
      return res.json({ message: "Announcement deleted successfully" });
    }

    memoryDb.deleteAnnouncement(req.params.id);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
