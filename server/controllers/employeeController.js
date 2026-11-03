const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const User = require("../models/User");
const memoryDb = require("../services/memoryDb");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR / Manager)
const getEmployees = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const employees = await Employee.find().populate("user", "name email role department");
      return res.json(employees);
    }

    const employees = memoryDb.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (HR)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, salary, joinDate, phone, address } = req.body;

    if (!name || !email || !password || !salary || !department) {
      return res.status(400).json({ message: "Please fill all required employee fields" });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: "Employee",
        department,
      });

      const employee = await Employee.create({
        user: user._id,
        department,
        salary: Number(salary),
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        phone: phone || "",
        address: address || "",
      });

      const populatedEmployee = await Employee.findById(employee._id).populate(
        "user",
        "name email role department"
      );

      return res.status(201).json(populatedEmployee);
    }

    const employee = memoryDb.createEmployee({
      name,
      email,
      department,
      salary,
      phone,
      address,
    });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR)
const updateEmployee = async (req, res) => {
  try {
    const { name, department, salary, phone, address, joinDate } = req.body;

    if (mongoose.connection.readyState === 1) {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (name) {
        await User.findByIdAndUpdate(employee.user, { name, department });
      }

      employee.department = department || employee.department;
      employee.salary = salary !== undefined ? Number(salary) : employee.salary;
      employee.phone = phone || employee.phone;
      employee.address = address || employee.address;
      if (joinDate) employee.joinDate = new Date(joinDate);

      const updated = await employee.save();
      const populated = await Employee.findById(updated._id).populate(
        "user",
        "name email role department"
      );

      return res.json(populated);
    }

    const updated = memoryDb.updateEmployee(req.params.id, {
      name,
      department,
      salary,
      phone,
      address,
    });
    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (HR)
const deleteEmployee = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await User.findByIdAndDelete(employee.user);
      await Employee.findByIdAndDelete(req.params.id);

      return res.json({ message: "Employee and user record deleted successfully" });
    }

    memoryDb.deleteEmployee(req.params.id);
    res.json({ message: "Employee and user record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
