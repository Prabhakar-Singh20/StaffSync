import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';

const AttendanceSummary = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get('/api/attendance');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
        Attendance Records ({records.length})
      </h3>

      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: '600', color: '#ffffff' }}>
                      {r.user?.name || 'Unnamed Employee'}
                    </td>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.checkInTime || '--:--'}</td>
                    <td>{r.checkOutTime || '--:--'}</td>
                    <td>
                      <span className={`badge badge-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;
