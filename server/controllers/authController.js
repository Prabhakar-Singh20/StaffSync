const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

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

    // If registered as Employee, create matching Employee record
    if (user.role === "Employee") {
      try {
        await Employee.create({
          user: user._id,
          department: user.department,
          salary: 45000,
          joinDate: new Date(),
          phone: "123-456-7890",
          address: "HQ Campus",
        });
      } catch (empErr) {
        console.warn("Notice: Employee profile record creation deferred:", empErr.message);
      }
    }

    res.status(201).json({
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
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get current logged-in user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    let employeeData = null;

    if (user && user.role === "Employee") {
      employeeData = await Employee.findOne({ user: user._id });
    }

    res.json({
      user,
      employee: employeeData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
