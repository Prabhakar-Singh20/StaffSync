const Employee = require("../models/Employee");
const User = require("../models/User");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR / Manager)
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("user", "name email role department");
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

    res.status(201).json(populatedEmployee);
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

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (HR)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete associated User
    await User.findByIdAndDelete(employee.user);
    // Delete Employee record
    await Employee.findByIdAndDelete(req.params.id);

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
