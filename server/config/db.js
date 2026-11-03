const mongoose = require("mongoose");

const autoSeedIfEmpty = async () => {
  try {
    const User = require("../models/User");
    const Employee = require("../models/Employee");
    const LeaveRequest = require("../models/LeaveRequest");
    const Attendance = require("../models/Attendance");
    const Announcement = require("../models/Announcement");
    const Training = require("../models/Training");

    const count = await User.countDocuments();
    if (count === 0) {
      console.log("Database empty. Auto-seeding default demo accounts...");

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

      await Employee.create({
        user: employeeUser._id,
        department: "Engineering",
        salary: 75000,
        joinDate: new Date("2024-01-15"),
        phone: "+91 98765 43210",
        address: "Bhopal, MP",
      });

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
        reason: "Medical checkup and personal leave",
        status: "Pending",
      });

      await Announcement.create({
        title: "Company Annual Meet 2026",
        message: "Join us this Friday in the main hall for our company annual meet and awards ceremony.",
        postedBy: hrUser._id,
        targetRole: "All",
      });

      await Training.create({
        title: "MongoDB CRUD",
        description: "This Training Session is based on the MongoDB CRUD Operation and Schema Modeling.",
        trainer: "Adnan Saif",
        date: new Date("2026-11-05"),
        targetDepartment: "Engineering",
        createdBy: managerUser._id,
      });

      console.log("Demo accounts initialized: hr@staffsync.com, manager@staffsync.com, employee@staffsync.com (Password: password123)");
    }
  } catch (err) {
    console.error("Auto-seed notice:", err.message);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // 1. If a valid MONGO_URI is provided, connect to it
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[StaffSync] MongoDB Connected to host: ${conn.connection.host}`);
      await autoSeedIfEmpty();
      return;
    } catch (error) {
      console.error(`[StaffSync] MongoDB Connection failed with MONGO_URI: ${error.message}`);
    }
  }

  // 2. Check if running in a cloud container (Render / Production)
  const isCloudHost = Boolean(process.env.RENDER || process.env.NODE_ENV === "production");

  if (isCloudHost) {
    console.warn(
      "[StaffSync] Running on Cloud environment (Render). Server started successfully. Please set MONGO_URI in Render Environment Variables with your free MongoDB Atlas connection string for persistent cloud data."
    );
    return;
  }

  // 3. Fallback for local desktop development only
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    console.log("[StaffSync] Starting local in-memory MongoDB server...");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[StaffSync] In-memory MongoDB Connected locally at: ${uri}`);
    await autoSeedIfEmpty();
  } catch (innerError) {
    console.warn(`[StaffSync] Local memory server notice: ${innerError.message}`);
  }
};

module.exports = connectDB;
