import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Announcements from '../components/employee/Announcements';
import Attendance from '../components/employee/Attendance';
import LeaveApply from '../components/employee/LeaveApply';
import LeaveList from '../components/employee/LeaveList';
import { LogOut, User, Bell, Calendar, Clock, ShieldCheck, Mail, Building, Phone, MapPin } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('announcements');
  const [profileData, setProfileData] = useState(null);
  const [refreshLeave, setRefreshLeave] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

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
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>Employee Portal</h1>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>StaffSync Workspace</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f3f4f6', display: 'block' }}>
              {user?.name}
            </span>
            <span className="badge badge-role" style={{ fontSize: '0.72rem' }}>
              {user?.department || 'Employee'}
            </span>
          </div>

          <button onClick={logout} className="btn btn-danger btn-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Navigation Tabs */}
        <div className="tabs-nav">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          >
            Announcements & Trainings
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          >
            Leaves
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          >
            Attendance
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            Profile
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'announcements' && <Announcements />}

        {activeTab === 'leaves' && (
          <div>
            <LeaveApply onLeaveApplied={() => setRefreshLeave((prev) => prev + 1)} />
            <LeaveList refreshTrigger={refreshLeave} />
          </div>
        )}

        {activeTab === 'attendance' && <Attendance />}

        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
              My Profile & Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Full Name</span>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                  {user?.name}
                </p>
              </div>

              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Email Address</span>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                  {user?.email}
                </p>
              </div>

              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Role</span>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#3b82f6', marginTop: '4px' }}>
                  {user?.role}
                </p>
              </div>

              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Department</span>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                  {user?.department || 'Engineering'}
                </p>
              </div>

              {profileData?.employee && (
                <>
                  <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Phone Number</span>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                      {profileData.employee.phone || 'Not provided'}
                    </p>
                  </div>

                  <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Joining Date</span>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                      {new Date(profileData.employee.joinDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '1px solid #374151', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Address</span>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                      {profileData.employee.address || 'Company Headquarters'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
