import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeCRUD from '../components/hr/EmployeeCRUD';
import LeaveApplications from '../components/hr/LeaveApplications';
import AttendanceSummary from '../components/hr/AttendanceSummary';
import AnnouncementsManager from '../components/hr/AnnouncementsManager';
import { LogOut, ShieldCheck } from 'lucide-react';

const HrDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('leaves');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f9fafb' }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 36px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1f2937'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex'
          }}>
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>HR Portal</h1>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Administrator Console</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f3f4f6', display: 'block' }}>
              {user?.name}
            </span>
            <span className="badge badge-role" style={{ fontSize: '0.72rem' }}>
              HR Administrator
            </span>
          </div>

          <button onClick={logout} className="btn btn-danger btn-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#ffffff', marginBottom: '24px' }}>
          HR Dashboard
        </h2>

        {/* Tabs Bar matching SkillWallet screenshot */}
        <div className="tabs-nav">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          >
            Leave Applications
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          >
            Employee Management
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          >
            Announcements
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          >
            Attendance
          </button>
        </div>

        {/* Tab Components */}
        {activeTab === 'leaves' && <LeaveApplications />}
        {activeTab === 'employees' && <EmployeeCRUD />}
        {activeTab === 'announcements' && <AnnouncementsManager />}
        {activeTab === 'attendance' && <AttendanceSummary />}
      </main>
    </div>
  );
};

export default HrDashboard;
