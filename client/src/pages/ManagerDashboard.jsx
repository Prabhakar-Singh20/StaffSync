import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LeaveApplications from '../components/manager/LeaveApplications';
import TrainingManagement from '../components/manager/TrainingManagement';
import { LogOut, Briefcase, ShieldCheck } from 'lucide-react';

const ManagerDashboard = () => {
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
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>Manager Dashboard</h1>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Team & Resource Management</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f3f4f6', display: 'block' }}>
              {user?.name}
            </span>
            <span className="badge badge-role" style={{ fontSize: '0.72rem' }}>
              Manager - {user?.department || 'Operations'}
            </span>
          </div>

          <button onClick={logout} className="btn btn-danger btn-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#ffffff' }}>
            Welcome Back, Manager
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '4px' }}>
            Review pending leave requests and manage workforce training programs
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="tabs-nav">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          >
            Leave Applications
          </button>

          <button
            onClick={() => setActiveTab('trainings')}
            className={`tab-btn ${activeTab === 'trainings' ? 'active' : ''}`}
          >
            Training & Development
          </button>
        </div>

        {/* Tab Components */}
        {activeTab === 'leaves' && <LeaveApplications />}
        {activeTab === 'trainings' && <TrainingManagement />}
      </main>
    </div>
  );
};

export default ManagerDashboard;
