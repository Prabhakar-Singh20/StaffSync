import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Calendar, User, Clock, AlertCircle } from 'lucide-react';

const LeaveApplications = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
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
      setMsg(`Leave application marked as ${newStatus}`);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filter === 'All') return true;
    return l.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
          Leave Applications ({leaves.length})
        </h3>

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
                    No {filter !== 'All' ? filter.toLowerCase() : ''} leave applications found.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const s = new Date(l.startDate).toLocaleDateString();
                  const e = new Date(l.endDate).toLocaleDateString();

                  return (
                    <tr key={l._id}>
                      <td style={{ fontWeight: '600', color: '#ffffff' }}>
                        {l.user?.name || 'Unknown'}
                      </td>
                      <td>
                        <span className="badge badge-role">{l.user?.department || 'General'}</span>
                      </td>
                      <td>
                        {s} &rarr; {e}
                      </td>
                      <td style={{ maxWidth: '240px', wordBreak: 'break-word', color: '#d1d5db' }}>
                        {l.reason}
                      </td>
                      <td>
                        <span className={`badge badge-${l.status.toLowerCase()}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleStatusUpdate(l._id, 'Approved')}
                              className="btn btn-success btn-sm"
                              title="Approve"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(l._id, 'Rejected')}
                              className="btn btn-danger btn-sm"
                              title="Reject"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Reviewed</span>
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
