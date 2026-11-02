import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, CalendarCheck, Briefcase, Award, ArrowRight, ShieldCheck } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'HR') navigate('/hr');
      else if (user.role === 'Manager') navigate('/manager');
      else navigate('/employee');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 48px',
        borderBottom: '1px solid #1f2937',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex'
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>
            HRM Portal
          </span>
        </div>

        <div>
          {user ? (
            <button onClick={handleGetStarted} className="btn btn-primary btn-sm">
              Go to Dashboard
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Login / Register
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
        flex: 1
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '20px',
          color: '#ffffff'
        }}>
          Empower Your Workforce with{' '}
          <span style={{
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HRM Portal
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#9ca3af',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          A smart Human Resource Management platform designed to simplify attendance tracking,
          leave management, employee records, and communication across teams.
        </p>

        <button
          onClick={handleGetStarted}
          className="btn btn-primary"
          style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '10px' }}
        >
          Get Started <ArrowRight size={18} />
        </button>

        {/* Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '24px',
          marginTop: '72px',
          textAlign: 'left'
        }}>
          {/* Card 1 */}
          <div className="card" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Users size={22} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#f3f4f6' }}>
              Employee Management
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Manage employee records, roles, and information efficiently.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CalendarCheck size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#f3f4f6' }}>
              Attendance & Leave
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Track attendance and handle leave approvals easily.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Briefcase size={22} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#f3f4f6' }}>
              HR & Manager Tools
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Handle team announcements, performance, and training modules.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Award size={22} color="#ec4899" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#f3f4f6' }}>
              Employee Growth
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: '1.5' }}>
              Monitor performance and assign development trainings.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid #1f2937',
        color: '#6b7280',
        fontSize: '0.85rem'
      }}>
        © 2026 HRM Portal — Empowering Teams, Simplifying Workflows.
      </footer>
    </div>
  );
};

export default Home;
