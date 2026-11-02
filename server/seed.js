const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const Employee = require("./models/Employee");
const LeaveRequest = require("./models/LeaveRequest");
const Attendance = require("./models/Attendance");
const Announcement = require("./models/Announcement");
const Training = require("./models/Training");

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Employee.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Attendance.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});

    console.log("Creating default users for HR, Manager, and Employee...");

    const hrUser = await User.create({
      name: "HR Admin",
      email: "hr@staffsync.com",
      password: "password123",
      role: "HR",
      department: "Human Resources",
    });

    const managerUser = await User.create({
      name: "Prabhakar Singh",
      email: "manager@staffsync.com",
      password: "password123",
      role: "Manager",
      department: "Engineering",
    });

    const employeeUser = await User.create({
      name: "Pravanshu Samadhiya",
      email: "employee@staffsync.com",
      password: "password123",
      role: "Employee",
      department: "Engineering",
    });

    const employee2 = await User.create({
      name: "Adnan Saif",
      email: "adnan@staffsync.com",
      password: "password123",
      role: "Employee",
      department: "Training & Development",
    });

    // Create Employee records
    await Employee.create({
      user: employeeUser._id,
      department: "Engineering",
      salary: 75000,
      joinDate: new Date("2024-01-15"),
      phone: "+91 98765 43210",
      address: "Bhopal, MP",
    });

    await Employee.create({
      user: employee2._id,
      department: "Training & Development",
      salary: 82000,
      joinDate: new Date("2023-08-10"),
      phone: "+91 91234 56789",
      address: "Indore, MP",
    });

    console.log("Seeding attendance records...");
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    await Attendance.create({
      user: employeeUser._id,
      date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
      checkInTime: "09:24:19 AM",
      checkOutTime: "06:07:23 PM",
      status: "Present",
    });

    await Attendance.create({
      user: employeeUser._id,
      date: new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())),
      checkInTime: "09:47:43 AM",
      checkOutTime: "05:47:54 PM",
      status: "Present",
    });

    console.log("Seeding leave requests...");
    await LeaveRequest.create({
      user: employeeUser._id,
      startDate: new Date("2026-11-05"),
      endDate: new Date("2026-11-06"),
      reason: "I have to go for Office Meeting",
      status: "Approved",
      reviewedBy: managerUser._id,
    });

    await LeaveRequest.create({
      user: employeeUser._id,
      startDate: new Date("2026-11-10"),
      endDate: new Date("2026-11-12"),
      reason: "Family function at hometown",
      status: "Rejected",
      reviewedBy: managerUser._id,
    });

    await LeaveRequest.create({
      user: employeeUser._id,
      startDate: new Date("2026-11-20"),
      endDate: new Date("2026-11-22"),
      reason: "Personal medical checkup and recovery",
      status: "Pending",
    });

    console.log("Seeding announcements...");
    await Announcement.create({
      title: "Company Annual Meet 2026",
      message: "Join us this Friday in the main hall for our company annual meet and awards ceremony.",
      postedBy: hrUser._id,
      targetRole: "All",
    });

    await Announcement.create({
      title: "Quarterly Performance Reviews",
      message: "All managers and employees please submit your self-evaluations before November 15.",
      postedBy: hrUser._id,
      targetRole: "All",
    });

    console.log("Seeding training programs...");
    await Training.create({
      title: "MongoDB CRUD",
      description: "This Training Session is based on the MongoDB CRUD Operation and Schema Modeling.",
      trainer: "Adnan Saif",
      date: new Date("2026-11-05"),
      targetDepartment: "Engineering",
      createdBy: managerUser._id,
    });

    await Training.create({
      title: "Modern React & REST APIs",
      description: "Interactive session exploring hooks, state management, and API design.",
      trainer: "Prabhakar Singh",
      date: new Date("2026-11-15"),
      targetDepartment: "All",
      createdBy: managerUser._id,
    });

    console.log("Database seeded successfully with demo accounts:");
    console.log("HR Admin: hr@staffsync.com / password123");
    console.log("Manager: manager@staffsync.com / password123");
    console.log("Employee: employee@staffsync.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
