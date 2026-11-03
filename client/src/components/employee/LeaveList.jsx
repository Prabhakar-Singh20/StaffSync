import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle } from 'lucide-react';

const LeaveList = ({ refreshTrigger }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves/my-leaves');
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
  }, [refreshTrigger]);

  const safeLeaves = Array.isArray(leaves) ? leaves : [];

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff', marginBottom: '18px' }}>
        My Leaves ({safeLeaves.length})
      </h3>

      {safeLeaves.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          {loading ? 'Loading leave history...' : 'No leave requests submitted yet.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {safeLeaves.map((leave) => {
            const start = leave.startDate ? new Date(leave.startDate).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }) : '--';
            const end = leave.endDate ? new Date(leave.endDate).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }) : '--';
            const reviewer =
              typeof leave.reviewedBy === 'object' && leave.reviewedBy
                ? `${leave.reviewedBy.name} (${leave.reviewedBy.role})`
                : leave.reviewedBy;

            return (
              <div
                key={leave._id || Math.random()}
                style={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Calendar size={16} color="#9ca3af" />
                    <span style={{ fontWeight: '600', color: '#f3f4f6', fontSize: '0.95rem' }}>
                      {start} &rarr; {end}
                    </span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '0.86rem' }}>{leave.reason || 'No reason provided'}</p>
                  {reviewer && leave.status !== 'Pending' && (
                    <span style={{ fontSize: '0.76rem', color: '#60a5fa', display: 'block', marginTop: '6px' }}>
                      Reviewed by: <strong>{reviewer}</strong>
                    </span>
                  )}
                </div>

                <div>
                  <span className={`badge badge-${(leave.status || 'pending').toLowerCase()}`}>
                    {leave.status || 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaveList;
