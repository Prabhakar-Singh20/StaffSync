// Central in-memory cloud database for Render / Server environments
// Ensures zero-setup real-time synchronization across all devices even before MongoDB Atlas is configured.
const bcrypt = require("bcryptjs");

const INITIAL_USERS = [
  {
    _id: "demo_hr_01",
    name: "HR Admin",
    email: "hr@staffsync.com",
    password: "password123",
    role: "HR",
    department: "Human Resources",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo_mgr_01",
    name: "Prabhakar Singh",
    email: "manager@staffsync.com",
    password: "password123",
    role: "Manager",
    department: "Engineering",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo_emp_01",
    name: "Pravanshu Samadhiya",
    email: "employee@staffsync.com",
    password: "password123",
    role: "Employee",
    department: "Engineering",
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EMPLOYEES = [
  {
    _id: "emp_rec_01",
    user: {
      _id: "demo_emp_01",
      name: "Pravanshu Samadhiya",
      email: "employee@staffsync.com",
      role: "Employee",
      department: "Engineering",
    },
    department: "Engineering",
    salary: 75000,
    joinDate: "2024-01-15T00:00:00.000Z",
    phone: "+91 98765 43210",
    address: "Bhopal, MP",
  },
];

const INITIAL_LEAVES = [
  {
    _id: "leave_01",
    user: {
      _id: "demo_emp_01",
      name: "Pravanshu Samadhiya",
      email: "employee@staffsync.com",
      role: "Employee",
      department: "Engineering",
    },
    startDate: "2026-11-05",
    endDate: "2026-11-06",
    reason: "I have to go for Office Meeting",
    status: "Approved",
    reviewedBy: { name: "Prabhakar Singh", role: "Manager" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "leave_02",
    user: {
      _id: "demo_emp_01",
      name: "Pravanshu Samadhiya",
      email: "employee@staffsync.com",
      role: "Employee",
      department: "Engineering",
    },
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    reason: "Family function at hometown",
    status: "Rejected",
    reviewedBy: { name: "HR Admin", role: "HR" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "leave_03",
    user: {
      _id: "demo_emp_01",
      name: "Pravanshu Samadhiya",
      email: "employee@staffsync.com",
      role: "Employee",
      department: "Engineering",
    },
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    reason: "Personal medical checkup and recovery",
    status: "Pending",
    reviewedBy: null,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    _id: "ann_01",
    title: "Company Annual Meet 2026",
    message: "Join us this Friday in the main hall for our company annual meet and awards ceremony.",
    targetRole: "All",
    postedBy: { name: "HR Admin", role: "HR" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "ann_02",
    title: "Quarterly Performance Reviews",
    message: "All managers and employees please submit your self-evaluations before November 15.",
    targetRole: "All",
    postedBy: { name: "Prabhakar Singh", role: "Manager" },
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_TRAININGS = [
  {
    _id: "trn_01",
    title: "MongoDB CRUD",
    description: "This Training Session is based on MongoDB CRUD Operation and Schema Modeling.",
    trainer: "Adnan Saif",
    date: "2026-11-05T00:00:00.000Z",
    targetDepartment: "Engineering",
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_ATTENDANCE = [
  {
    _id: "att_01",
    user: {
      _id: "demo_emp_01",
      name: "Pravanshu Samadhiya",
      email: "employee@staffsync.com",
      role: "Employee",
      department: "Engineering",
    },
    date: new Date().toISOString(),
    checkInTime: "09:24:19 AM",
    checkOutTime: "06:07:23 PM",
    status: "Present",
  },
];

// Persistent state in Node.js server memory
class MemoryDatabase {
  constructor() {
    this.users = [...INITIAL_USERS];
    this.employees = [...INITIAL_EMPLOYEES];
    this.leaves = [...INITIAL_LEAVES];
    this.announcements = [...INITIAL_ANNOUNCEMENTS];
    this.trainings = [...INITIAL_TRAININGS];
    this.attendance = [...INITIAL_ATTENDANCE];
  }

  // --- Users & Auth ---
  findUserByEmail(email) {
    const clean = (email || "").toLowerCase().trim();
    return this.users.find((u) => u.email.toLowerCase() === clean) || null;
  }

  findUserById(id) {
    return this.users.find((u) => String(u._id) === String(id)) || null;
  }

  createUser(userData) {
    const user = {
      _id: "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: (userData.name || "").trim(),
      email: (userData.email || "").toLowerCase().trim(),
      password: userData.password,
      role: userData.role || "Employee",
      department: userData.department || "Engineering",
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);

    // If Employee role, automatically create matching employee record
    if (user.role === "Employee") {
      this.employees.push({
        _id: "emp_" + Date.now(),
        user: { ...user },
        department: user.department,
        salary: 45000,
        joinDate: new Date().toISOString(),
        phone: "+91 98765 00000",
        address: "HQ Campus",
      });
    }

    return user;
  }

  verifyPassword(user, password) {
    if (!user) return false;
    // Allow plain match or bcrypt match
    if (user.password === password) return true;
    try {
      return bcrypt.compareSync(password, user.password);
    } catch {
      return false;
    }
  }

  // --- Leaves ---
  getAllLeaves() {
    return [...this.leaves];
  }

  getMyLeaves(userId, email) {
    const cleanEmail = (email || "").toLowerCase();
    return this.leaves.filter((l) => {
      const lId = l.user?._id;
      const lEmail = l.user?.email?.toLowerCase();
      return (userId && String(lId) === String(userId)) || (cleanEmail && lEmail === cleanEmail);
    });
  }

  createLeave(leaveData, currentUser) {
    const leave = {
      _id: "leave_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department || "Engineering",
        role: currentUser.role || "Employee",
      },
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      reason: leaveData.reason,
      status: "Pending",
      reviewedBy: null,
      createdAt: new Date().toISOString(),
    };
    this.leaves.unshift(leave);
    return leave;
  }

  updateLeaveStatus(leaveId, status, reviewer) {
    const leave = this.leaves.find((l) => String(l._id) === String(leaveId));
    if (!leave) return null;

    leave.status = status;
    leave.reviewedBy = {
      name: reviewer.name,
      role: reviewer.role,
    };
    return leave;
  }

  // --- Attendance ---
  getAllAttendance() {
    return [...this.attendance];
  }

  getMyAttendance(userId, email) {
    const cleanEmail = (email || "").toLowerCase();
    return this.attendance.filter((a) => {
      const aId = a.user?._id;
      const aEmail = a.user?.email?.toLowerCase();
      return (userId && String(aId) === String(userId)) || (cleanEmail && aEmail === cleanEmail);
    });
  }

  checkIn(currentUser) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = this.attendance.find((a) => {
      const aId = a.user?._id;
      const aDate = (a.date || "").slice(0, 10);
      return String(aId) === String(currentUser._id) && aDate === todayStr;
    });

    if (existing) {
      const err = new Error("You have already checked in for today");
      err.record = existing;
      throw err;
    }

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const record = {
      _id: "att_" + Date.now(),
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
      },
      date: new Date().toISOString(),
      checkInTime: timeStr,
      status: "Present",
    };
    this.attendance.unshift(record);
    return record;
  }

  checkOut(currentUser) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const record = this.attendance.find((a) => {
      const aId = a.user?._id;
      const aDate = (a.date || "").slice(0, 10);
      return String(aId) === String(currentUser._id) && aDate === todayStr;
    });

    if (!record) {
      throw new Error("You need to check in first before checking out");
    }

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    record.checkOutTime = timeStr;
    return record;
  }

  // --- Announcements ---
  getAllAnnouncements() {
    return [...this.announcements];
  }

  createAnnouncement(annData, currentUser) {
    const ann = {
      _id: "ann_" + Date.now(),
      title: annData.title,
      message: annData.message,
      targetRole: annData.targetRole || "All",
      postedBy: {
        name: currentUser.name,
        role: currentUser.role,
      },
      createdAt: new Date().toISOString(),
    };
    this.announcements.unshift(ann);
    return ann;
  }

  deleteAnnouncement(id) {
    this.announcements = this.announcements.filter((a) => String(a._id) !== String(id));
    return true;
  }

  // --- Employees ---
  getAllEmployees() {
    return [...this.employees];
  }

  createEmployee(empData) {
    const user = {
      _id: "usr_" + Date.now(),
      name: empData.name,
      email: (empData.email || "").toLowerCase().trim(),
      role: "Employee",
      department: empData.department,
    };
    const emp = {
      _id: "emp_" + Date.now(),
      user,
      department: empData.department,
      salary: Number(empData.salary) || 50000,
      joinDate: new Date().toISOString(),
      phone: empData.phone || "+91 98765 00000",
      address: empData.address || "HQ Campus",
    };
    this.employees.push(emp);
    return emp;
  }

  updateEmployee(id, empData) {
    const emp = this.employees.find((e) => String(e._id) === String(id));
    if (!emp) return null;
    emp.department = empData.department || emp.department;
    emp.salary = empData.salary ? Number(empData.salary) : emp.salary;
    emp.phone = empData.phone || emp.phone;
    emp.address = empData.address || emp.address;
    if (emp.user && empData.name) emp.user.name = empData.name;
    return emp;
  }

  deleteEmployee(id) {
    this.employees = this.employees.filter((e) => String(e._id) !== String(id));
    return true;
  }

  // --- Trainings ---
  getAllTrainings() {
    return [...this.trainings];
  }

  createTraining(trnData) {
    const trn = {
      _id: "trn_" + Date.now(),
      title: trnData.title,
      description: trnData.description,
      trainer: trnData.trainer,
      date: trnData.date,
      targetDepartment: trnData.targetDepartment || "All",
      createdAt: new Date().toISOString(),
    };
    this.trainings.unshift(trn);
    return trn;
  }

  deleteTraining(id) {
    this.trainings = this.trainings.filter((t) => String(t._id) !== String(id));
    return true;
  }
}

// Singleton instance across all requests on the server
const memoryDb = new MemoryDatabase();
module.exports = memoryDb;
