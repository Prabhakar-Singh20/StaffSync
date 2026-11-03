import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LeaveApplications = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves');
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setMsg('');
    setError('');
    try {
      await axios.put(`/api/leaves/${id}/status`, { status: newStatus });
      setMsg(`Leave application marked as ${newStatus} by ${user?.name || user?.role || 'you'}`);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const filteredLeaves = safeLeaves.filter((l) => {
    if (!l) return false;
    if (filter === 'All') return true;
    return l.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
            Leave Applications ({safeLeaves.length})
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '2px' }}>
            Reviewed by both HR Admins & Managers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-secondary'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '0.88rem' }}>
          {msg}
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    {loading ? 'Loading leave applications...' : `No ${filter !== 'All' ? filter.toLowerCase() : ''} leave applications found.`}
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const s = l.startDate ? new Date(l.startDate).toLocaleDateString() : '--';
                  const e = l.endDate ? new Date(l.endDate).toLocaleDateString() : '--';
                  const reviewer =
                    typeof l.reviewedBy === 'object' && l.reviewedBy
                      ? `${l.reviewedBy.name} (${l.reviewedBy.role})`
                      : l.reviewedBy;

                  return (
                    <tr key={l._id || Math.random()}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#ffffff' }}>
                          {l.user?.name || 'Unnamed Employee'}
                        </div>
                        {l.user?.email && (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{l.user.email}</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-role">{l.user?.department || 'General'}</span>
                      </td>
                      <td>
                        {s} &rarr; {e}
                      </td>
                      <td style={{ maxWidth: '240px', wordBreak: 'break-word', color: '#d1d5db' }}>
                        {l.reason || 'No reason provided'}
                      </td>
                      <td>
                        <span className={`badge badge-${(l.status || 'pending').toLowerCase()}`}>
                          {l.status || 'Pending'}
                        </span>
                        {reviewer && l.status !== 'Pending' && (
                          <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '4px' }}>
                            By: <span style={{ color: '#60a5fa' }}>{reviewer}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleStatusUpdate(l._id, 'Approved')}
                              className="btn btn-success btn-sm"
                              title="Approve Leave"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(l._id, 'Rejected')}
                              className="btn btn-danger btn-sm"
                              title="Reject Leave"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplications;
