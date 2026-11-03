const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");
const memoryDb = require("../services/memoryDb");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "staffsync_super_secret_jwt_key_2026",
    { expiresIn: "30d" }
  );
};

// @desc   Register a new user (HR, Manager, or Employee)
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields: Name, Email, and Password" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: "A user with this email already exists. Please log in or use a different email." });
      }

      const user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password,
        role: role || "Employee",
        department: department || "Engineering",
      });

      if (user.role === "Employee") {
        try {
          await Employee.create({
            user: user._id,
            department: user.department,
            salary: 45000,
            joinDate: new Date(),
            phone: "+91 98765 00000",
            address: "HQ Campus",
          });
        } catch (empErr) {
          console.warn("Notice: Employee profile creation deferred:", empErr.message);
        }
      }

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    }

    // In-memory cloud fallback
    if (memoryDb.findUserByEmail(cleanEmail)) {
      return res.status(400).json({ message: "A user with this email already exists. Please log in or use a different email." });
    }

    const user = memoryDb.createUser({
      name: cleanName,
      email: cleanEmail,
      password,
      role: role || "Employee",
      department: department || "Engineering",
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Server error during registration" });
  }
};

// @desc   Auth user & get token
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          token: generateToken(user._id),
        });
      }
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // In-memory cloud fallback
    const user = memoryDb.findUserByEmail(cleanEmail);
    if (user && memoryDb.verifyPassword(user, password)) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get current logged-in user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id).select("-password");
      let employeeData = null;
      if (user && user.role === "Employee") {
        employeeData = await Employee.findOne({ user: user._id });
      }
      return res.json({ user, employee: employeeData });
    }

    const user = memoryDb.findUserById(req.user._id);
    const employees = memoryDb.getAllEmployees();
    const empData = employees.find(
      (e) => String(e.user?._id) === String(req.user._id) || e.user?.email === req.user.email
    );

    res.json({
      user,
      employee: empData || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
