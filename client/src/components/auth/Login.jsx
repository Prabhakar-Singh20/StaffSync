import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'HR') navigate('/hr');
      else if (res.user.role === 'Manager') navigate('/manager');
      else navigate('/employee');
    } else {
      setError(res.message);
    }
  };

  const fillDemo = (demoRole) => {
    if (demoRole === 'HR') {
      setEmail('hr@staffsync.com');
      setPassword('password123');
    } else if (demoRole === 'Manager') {
      setEmail('manager@staffsync.com');
      setPassword('password123');
    } else {
      setEmail('employee@staffsync.com');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0f19',
      padding: '24px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', backgroundColor: '#111827' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#ffffff' }}>HRM Portal Login</h2>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af', marginTop: '6px' }}>
            Sign in to access your role-based dashboard
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Select Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1f2937' }}>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', textAlign: 'center' }}>
            Quick Demo Accounts:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillDemo('HR')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              HR Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('Manager')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillDemo('Employee')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Employee
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#9ca3af' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
