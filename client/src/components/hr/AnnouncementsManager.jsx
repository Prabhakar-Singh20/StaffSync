import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AnnouncementsManager = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      await axios.post('/api/announcements', { title, message, targetRole });
      setMsg(`Announcement published by ${user?.name || user?.role || 'you'}!`);
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/api/announcements/${id}`);
      setMsg('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Create Announcement */}
      <div className="card">
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff' }}>
            Publish Announcement
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '2px' }}>
            Posting as: <span style={{ color: '#60a5fa', fontWeight: '600' }}>{user?.name || 'Authorized User'} ({user?.role || 'Staff'})</span>
          </p>
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
            {msg}
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Q4 Townhall Meeting / Team Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="Write the announcement details here for employees & management..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select
              className="form-select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="All">All Roles (Employees, Managers & HR)</option>
              <option value="Employee">Employees Only</option>
              <option value="Manager">Managers Only</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <Plus size={16} /> Publish Announcement
          </button>
        </form>
      </div>

      {/* Existing Announcements List */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff', marginBottom: '18px' }}>
          Organization Announcements ({safeAnnouncements.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto' }}>
          {safeAnnouncements.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              {loading ? 'Loading announcements...' : 'No announcements active.'}
            </p>
          ) : (
            safeAnnouncements.map((item) => {
              const authorName = item.postedBy?.name || 'Administrator';
              const authorRole = item.postedBy?.role || 'Admin';

              return (
                <div
                  key={item._id || Math.random()}
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>{item.title}</h4>
                      <span className="badge badge-role">{item.targetRole || 'All'}</span>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.86rem', lineHeight: '1.4' }}>{item.message}</p>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '8px', display: 'flex', gap: '12px' }}>
                      <span>
                        Posted by: <strong style={{ color: '#60a5fa' }}>{authorName}</strong> ({authorRole})
                      </span>
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '--'}</span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManager;
