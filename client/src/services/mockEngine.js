// Client-side HRM persistence engine for standalone/Vercel environments
// Ensures registration, login, leaves, attendance, employees, announcements,
// and trainings work 100% seamlessly across HR, Manager, and Employee roles.

const SEED_USERS = [
  {
    _id: "demo_hr_01",
    name: "HR Admin",
    email: "hr@staffsync.com",
    password: "password123",
    role: "HR",
    department: "Human Resources",
  },
  {
    _id: "demo_mgr_01",
    name: "Prabhakar Singh",
    email: "manager@staffsync.com",
    password: "password123",
    role: "Manager",
    department: "Engineering",
  },
  {
    _id: "demo_emp_01",
    name: "Pravanshu Samadhiya",
    email: "employee@staffsync.com",
    password: "password123",
    role: "Employee",
    department: "Engineering",
  },
];

const SEED_EMPLOYEES = [
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

const SEED_LEAVES = [
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
    reviewedBy: "Prabhakar Singh (Manager)",
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
    reviewedBy: "HR Admin (HR)",
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

const SEED_ANNOUNCEMENTS = [
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

const SEED_TRAININGS = [
  {
    _id: "trn_01",
    title: "MongoDB CRUD",
    description: "This Training Session is based on the MongoDB CRUD Operation and Schema Modeling.",
    trainer: "Adnan Saif",
    date: "2026-11-05T00:00:00.000Z",
    targetDepartment: "Engineering",
    createdAt: new Date().toISOString(),
  },
];

const SEED_ATTENDANCE = [
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

const memoryStore = {};

const getStore = (key, fallback) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(`staffsync_store_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    }
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  } catch {
    return fallback;
  }
};

const setStore = (key, val) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`staffsync_store_${key}`, JSON.stringify(val));
    } else {
      memoryStore[key] = val;
    }
  } catch (e) {
    console.error(e);
  }
};

// Initialize seed data
export const initMockStore = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    if (!window.localStorage.getItem("staffsync_store_users")) setStore("users", SEED_USERS);
    if (!window.localStorage.getItem("staffsync_store_employees")) setStore("employees", SEED_EMPLOYEES);
    if (!window.localStorage.getItem("staffsync_store_leaves")) setStore("leaves", SEED_LEAVES);
    if (!window.localStorage.getItem("staffsync_store_announcements")) setStore("announcements", SEED_ANNOUNCEMENTS);
    if (!window.localStorage.getItem("staffsync_store_trainings")) setStore("trainings", SEED_TRAININGS);
    if (!window.localStorage.getItem("staffsync_store_attendance")) setStore("attendance", SEED_ATTENDANCE);
  } else {
    if (!memoryStore.users) memoryStore.users = [...SEED_USERS];
    if (!memoryStore.employees) memoryStore.employees = [...SEED_EMPLOYEES];
    if (!memoryStore.leaves) memoryStore.leaves = [...SEED_LEAVES];
    if (!memoryStore.announcements) memoryStore.announcements = [...SEED_ANNOUNCEMENTS];
    if (!memoryStore.trainings) memoryStore.trainings = [...SEED_TRAININGS];
    if (!memoryStore.attendance) memoryStore.attendance = [...SEED_ATTENDANCE];
  }
};

// Process mock request when backend is unavailable (e.g. on Vercel)
export const handleMockRequest = (config) => {
  initMockStore();

  const method = config.method?.toUpperCase();
  const url = config.url || "";
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  // Get current active user
  let currentUser = null;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem("staffsync_user");
      if (raw) currentUser = JSON.parse(raw);
    }
  } catch {}

  // 1. POST /api/auth/register
  if (url.includes("/api/auth/register") && method === "POST") {
    const users = getStore("users", SEED_USERS);
    const cleanEmail = (body.email || "").toLowerCase().trim();

    if (users.find((u) => u.email.toLowerCase() === cleanEmail)) {
      const err = new Error("A user with this email already exists. Please log in or use a different email.");
      err.response = { data: { message: err.message }, status: 400 };
      throw err;
    }

    const newUser = {
      _id: "user_" + Date.now(),
      name: (body.name || "").trim(),
      email: cleanEmail,
      password: body.password || "password123",
      role: body.role || "Employee",
      department: body.department || "Engineering",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStore("users", users);

    // If Employee, create employee profile record so HR sees them immediately
    if (newUser.role === "Employee") {
      const employees = getStore("employees", SEED_EMPLOYEES);
      employees.push({
        _id: "emp_" + Date.now(),
        user: newUser,
        department: newUser.department,
        salary: 45000,
        joinDate: new Date().toISOString(),
        phone: "+91 98765 00000",
        address: "HQ Campus",
      });
      setStore("employees", employees);
    }

    return {
      status: 201,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        token: "demo_token_" + newUser._id,
      },
    };
  }

  // 2. POST /api/auth/login
  if (url.includes("/api/auth/login") && method === "POST") {
    const users = getStore("users", SEED_USERS);
    const cleanEmail = (body.email || "").toLowerCase().trim();
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === body.password
    );

    if (user) {
      return {
        status: 200,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          token: "demo_token_" + user._id,
        },
      };
    } else {
      const err = new Error("Invalid email or password");
      err.response = { data: { message: err.message }, status: 401 };
      throw err;
    }
  }

  // 3. GET /api/auth/me
  if (url.includes("/api/auth/me") && method === "GET") {
    const employees = getStore("employees", SEED_EMPLOYEES);
    const empData = employees.find((e) => e.user?._id === currentUser?._id || e.user?.email === currentUser?.email);
    return {
      status: 200,
      data: {
        user: currentUser,
        employee: empData || null,
      },
    };
  }

  // 4. LEAVES (Both HR and Manager can view all, approve, or reject)
  if (url.includes("/api/leaves")) {
    let leaves = getStore("leaves", SEED_LEAVES);

    if (method === "GET") {
      if (url.includes("/my-leaves")) {
        const myLeaves = leaves.filter((l) => {
          const lId = l.user?._id;
          const lEmail = l.user?.email?.toLowerCase();
          const curId = currentUser?._id;
          const curEmail = currentUser?.email?.toLowerCase();
          return (curId && lId === curId) || (curEmail && lEmail === curEmail);
        });
        return { status: 200, data: myLeaves };
      }
      // Both HR and Manager get ALL company leaves
      return { status: 200, data: leaves };
    }

    if (method === "POST") {
      const newLeave = {
        _id: "leave_" + Date.now(),
        user: {
          _id: currentUser?._id || "user_" + Date.now(),
          name: currentUser?.name || "Employee",
          email: currentUser?.email || "employee@staffsync.com",
          department: currentUser?.department || "Engineering",
          role: currentUser?.role || "Employee",
        },
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason,
        status: "Pending",
        reviewedBy: null,
        createdAt: new Date().toISOString(),
      };
      leaves.unshift(newLeave);
      setStore("leaves", leaves);
      return { status: 201, data: newLeave };
    }

    if (method === "PUT" && url.includes("/status")) {
      const idMatch = url.match(/\/api\/leaves\/([^\/]+)\/status/);
      const leaveId = idMatch ? idMatch[1] : null;
      const reviewerName = currentUser?.name || "Admin";
      const reviewerRole = currentUser?.role || "Manager";

      leaves = leaves.map((l) =>
        l._id === leaveId
          ? {
              ...l,
              status: body.status,
              reviewedBy: `${reviewerName} (${reviewerRole})`,
            }
          : l
      );
      setStore("leaves", leaves);
      const updated = leaves.find((l) => l._id === leaveId);
      return { status: 200, data: updated || {} };
    }
  }

  // 5. ATTENDANCE
  if (url.includes("/api/attendance")) {
    let attendance = getStore("attendance", SEED_ATTENDANCE);

    if (method === "GET") {
      if (url.includes("/my-attendance")) {
        const myAtt = attendance.filter((a) => {
          const aId = a.user?._id;
          const aEmail = a.user?.email?.toLowerCase();
          const curId = currentUser?._id;
          const curEmail = currentUser?.email?.toLowerCase();
          return (curId && aId === curId) || (curEmail && aEmail === curEmail);
        });
        return { status: 200, data: myAtt };
      }
      return { status: 200, data: attendance };
    }

    if (method === "POST" && url.includes("/check-in")) {
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      const record = {
        _id: "att_" + Date.now(),
        user: {
          _id: currentUser?._id || "user_" + Date.now(),
          name: currentUser?.name || "Employee",
          email: currentUser?.email || "employee@staffsync.com",
          department: currentUser?.department || "Engineering",
        },
        date: new Date().toISOString(),
        checkInTime: timeStr,
        status: "Present",
      };
      attendance.unshift(record);
      setStore("attendance", attendance);
      return { status: 201, data: { message: "Check-in successful", record } };
    }

    if (method === "POST" && url.includes("/check-out")) {
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      if (attendance.length > 0) {
        attendance[0].checkOutTime = timeStr;
      }
      setStore("attendance", attendance);
      return { status: 200, data: { message: "Check-out successful", record: attendance[0] } };
    }
  }

  // 6. EMPLOYEES CRUD
  if (url.includes("/api/employees")) {
    let employees = getStore("employees", SEED_EMPLOYEES);

    if (method === "GET") {
      return { status: 200, data: employees };
    }

    if (method === "POST") {
      const newEmp = {
        _id: "emp_" + Date.now(),
        user: {
          _id: "user_" + Date.now(),
          name: body.name,
          email: body.email,
          role: "Employee",
          department: body.department,
        },
        department: body.department,
        salary: Number(body.salary),
        joinDate: new Date().toISOString(),
        phone: body.phone || "+91 98765 00000",
        address: body.address || "HQ Campus",
      };
      employees.push(newEmp);
      setStore("employees", employees);
      return { status: 201, data: newEmp };
    }

    if (method === "PUT") {
      const idMatch = url.match(/\/api\/employees\/([^\/]+)/);
      const empId = idMatch ? idMatch[1] : null;
      employees = employees.map((e) => {
        if (e._id === empId) {
          return {
            ...e,
            department: body.department || e.department,
            salary: body.salary ? Number(body.salary) : e.salary,
            phone: body.phone || e.phone,
            address: body.address || e.address,
            user: { ...e.user, name: body.name || e.user.name },
          };
        }
        return e;
      });
      setStore("employees", employees);
      return { status: 200, data: employees.find((e) => e._id === empId) };
    }

    if (method === "DELETE") {
      const idMatch = url.match(/\/api\/employees\/([^\/]+)/);
      const empId = idMatch ? idMatch[1] : null;
      employees = employees.filter((e) => e._id !== empId);
      setStore("employees", employees);
      return { status: 200, data: { message: "Employee deleted successfully" } };
    }
  }

  // 7. ANNOUNCEMENTS (Created by either HR or Manager, visible to all)
  if (url.includes("/api/announcements")) {
    let announcements = getStore("announcements", SEED_ANNOUNCEMENTS);

    if (method === "GET") {
      return { status: 200, data: announcements };
    }

    if (method === "POST") {
      const newAnn = {
        _id: "ann_" + Date.now(),
        title: body.title,
        message: body.message,
        targetRole: body.targetRole || "All",
        postedBy: {
          name: currentUser?.name || (currentUser?.role === "Manager" ? "Manager" : "HR Admin"),
          role: currentUser?.role || "HR",
        },
        createdAt: new Date().toISOString(),
      };
      announcements.unshift(newAnn);
      setStore("announcements", announcements);
      return { status: 201, data: newAnn };
    }

    if (method === "DELETE") {
      const idMatch = url.match(/\/api\/announcements\/([^\/]+)/);
      const annId = idMatch ? idMatch[1] : null;
      announcements = announcements.filter((a) => a._id !== annId);
      setStore("announcements", announcements);
      return { status: 200, data: { message: "Announcement deleted" } };
    }
  }

  // 8. TRAININGS
  if (url.includes("/api/trainings")) {
    let trainings = getStore("trainings", SEED_TRAININGS);

    if (method === "GET") {
      return { status: 200, data: trainings };
    }

    if (method === "POST") {
      const newTrn = {
        _id: "trn_" + Date.now(),
        title: body.title,
        description: body.description,
        trainer: body.trainer,
        date: body.date,
        targetDepartment: body.targetDepartment || "All",
        createdAt: new Date().toISOString(),
      };
      trainings.unshift(newTrn);
      setStore("trainings", trainings);
      return { status: 201, data: newTrn };
    }

    if (method === "DELETE") {
      const idMatch = url.match(/\/api\/trainings\/([^\/]+)/);
      const trnId = idMatch ? idMatch[1] : null;
      trainings = trainings.filter((t) => t._id !== trnId);
      setStore("trainings", trainings);
      return { status: 200, data: { message: "Training deleted" } };
    }
  }

  return null;
};
