# StaffSync — Modern Human Resource Management Solution (HRM)

StaffSync is an enterprise-grade, full-stack Human Resource Management (HRM) application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js). It implements secure JSON Web Token (JWT) authentication, granular Role-Based Access Control (RBAC), and follows the **Model-View-Controller (MVC)** architectural pattern.

---

## 1. Technical Architecture

StaffSync is structured into three distinct tiers:

```
+-------------------------------------------------------------+
|                        CLIENT TIER                          |
|  React 18 + Vite SPA | React Router DOM | Lucide Icons      |
|  - HR Dashboard      - Manager Dashboard  - Employee Portal |
+------------------------------+------------------------------+
                               | REST API (HTTP / JSON / JWT)
                               v
+-------------------------------------------------------------+
|                        SERVER TIER                          |
|  Node.js + Express.js (MVC Pattern)                         |
|  - Middleware: JWT Auth, RBAC Role Guards, CORS             |
|  - Controllers: Auth, Employee, Leave, Attendance, Notices  |
|  - Routes: /api/auth, /api/employees, /api/leaves, ...      |
+------------------------------+------------------------------+
                               | Mongoose ODM
                               v
+-------------------------------------------------------------+
|                       DATABASE TIER                         |
|  MongoDB / MongoDB Atlas / In-Memory MongoDB                |
|  - Collections: Users, Employees, Leaves, Attendance, etc.  |
+-------------------------------------------------------------+
```

---

## 2. Entity-Relationship (ER) Diagram

```
       +-----------------------+              +-----------------------+
       |         User          |              |       Employee        |
       +-----------------------+              +-----------------------+
       | _id (PK)              |<------------+| _id (PK)              |
       | name: String          |   1 : 1      | user: ObjectId (FK)   |
       | email: String (Unique)|              | department: String    |
       | password: String(Hash)|              | salary: Number        |
       | role: Enum            |              | joinDate: Date        |
       | department: String    |              | phone: String         |
       | createdAt: Date       |              | address: String       |
       +-----------+-----------+              +-----------------------+
                   |
       +-----------+-----------------------------------+
       | 1 : N                                         | 1 : N
       v                                               v
+-----------------------+                      +-----------------------+
|     LeaveRequest      |                      |      Attendance       |
+-----------------------+                      +-----------------------+
| _id (PK)              |                      | _id (PK)              |
| user: ObjectId (FK)   |                      | user: ObjectId (FK)   |
| startDate: Date       |                      | date: Date            |
| endDate: Date         |                      | checkInTime: String   |
| reason: String        |                      | checkOutTime: String  |
| status: Enum          |                      | status: Enum          |
| reviewedBy: FK (User) |                      +-----------------------+
+-----------------------+                      (Compound unique: user + date)
       |
       | 1 : N
       v
+-----------------------+                      +-----------------------+
|     Announcement      |                      |       Training        |
+-----------------------+                      +-----------------------+
| _id (PK)              |                      | _id (PK)              |
| title: String         |                      | title: String         |
| message: String       |                      | description: String   |
| postedBy: FK (User)   |                      | trainer: String       |
| targetRole: Enum      |                      | date: Date            |
| createdAt: Date       |                      | createdBy: FK (User)  |
+-----------------------+                      +-----------------------+
```

---

## 3. Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| **HR Admin** | • Full Employee CRUD (Add, Edit, View, Delete employee records)<br>• Review and approve/reject leave requests company-wide<br>• View company-wide employee attendance records<br>• Publish, broadcast, and delete company announcements |
| **Manager** | • Review and approve/reject leave applications submitted by department staff<br>• Create, schedule, and assign workforce training programs (e.g. MongoDB CRUD)<br>• View organization announcements and progress |
| **Employee** | • Daily Check-In and Check-Out with real-time status tracking<br>• Submit leave requests (start date, end date, reason)<br>• Track leave history and approval status (*Pending / Approved / Rejected*)<br>• View company announcements and assigned training sessions<br>• Review personal profile and employment data |

---

## 4. User Flow

```
                     +-------------------+
                     |    User Visits    |
                     |   Landing Page    |
                     +---------+---------+
                               |
                               v
                     +-------------------+
                     |   Login / Auth    |
                     +---------+---------+
                               |
            +------------------+------------------+
            | (Role Verification via JWT)         |
            v                                     v
+-----------------------+             +-----------------------+
|     HR Admin Flow     |             |     Employee Flow     |
| - Manage Employees    |             | - Daily Check-In/Out  |
| - Approve/Reject Leave|             | - Apply for Leave     |
| - Broadcast Notices   |             | - Track Leave Status  |
| - Attendance Logs     |             | - View Announcements  |
+-----------------------+             +-----------------------+
            |
            v
+-----------------------+
|     Manager Flow      |
| - Review Team Leaves  |
| - Schedule Trainings  |
+-----------------------+
```

---

## 5. MVC Architectural Pattern

StaffSync strictly adheres to the **Model-View-Controller** design pattern:

- **Model Layer (`server/models/`)**: Defines the data structure, constraints, schemas, and password hashing hooks using Mongoose (`User.js`, `Employee.js`, `Attendance.js`, `LeaveRequest.js`, `Announcement.js`, `Training.js`).
- **Controller Layer (`server/controllers/`)**: Encapsulates the business logic, request validation, processing, and response dispatching (`authController.js`, `employeeController.js`, `leaveController.js`, `attendanceController.js`, `announcementController.js`, `trainingController.js`).
- **View / Routing Layer (`server/routes/` + `client/`)**: Routes define REST endpoints and delegate requests to the appropriate controllers. The frontend React Single Page Application serves as the rich interactive client view.

---

## 6. Project Setup and Directory Structure

```
skill wallet/
│
├── client/                      # React 18 + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login.jsx, Register.jsx
│   │   │   ├── employee/        # Announcements.jsx, Attendance.jsx, LeaveApply.jsx, LeaveList.jsx
│   │   │   ├── hr/              # EmployeeCRUD.jsx, LeaveApplications.jsx, AttendanceSummary.jsx, AnnouncementsManager.jsx
│   │   │   ├── manager/         # LeaveApplications.jsx, TrainingManagement.jsx
│   │   │   └── Home.jsx         # Landing Hero Page
│   │   ├── context/             # AuthContext.jsx
│   │   ├── pages/               # EmployeeDashboard.jsx, HrDashboard.jsx, ManagerDashboard.jsx
│   │   ├── routes/              # ProtectedRoute.jsx
│   │   ├── App.jsx              # Main App & Router
│   │   ├── index.css            # Dark Theme CSS
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── config/                  # db.js (MongoDB Connection + Auto-Seed fallback)
│   ├── controllers/             # authController, employeeController, leaveController, ...
│   ├── middleware/              # auth.js (JWT protect & authorize guards)
│   ├── models/                  # User, Employee, LeaveRequest, Attendance, Announcement, Training
│   ├── routes/                  # authRoutes, employeeRoutes, leaveRoutes, ...
│   ├── .env                     # Server Environment Variables
│   ├── package.json
│   ├── seed.js                  # Standalone Seeder Script
│   └── server.js                # Server Entrypoint
│
└── README.md
```

---

## 7. Steps for Project Execution

### Step 1: Start the Backend Server

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies (already installed):
   ```bash
   npm install
   ```
3. Start the backend:
   ```bash
   npm start
   ```
   *The server will run on **http://localhost:5000** and auto-connect to MongoDB.*

---

### Step 2: Start the Frontend Client

1. Open a second terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies (already installed):
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 8. Demo Accounts & Credentials

The system comes pre-loaded with three ready-to-test accounts:

| Role | Email | Password |
|---|---|---|
| **HR Admin** | `hr@staffsync.com` | `password123` |
| **Manager** | `manager@staffsync.com` | `password123` |
| **Employee** | `employee@staffsync.com` | `password123` |

*(You can also use the 1-click quick login buttons on the Login page).*
