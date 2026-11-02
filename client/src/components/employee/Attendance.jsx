import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/api/attendance/my-attendance');
      setRecords(res.data);

      const todayStr = new Date().toISOString().slice(0, 10);
      const found = res.data.find((r) => {
        const rDate = new Date(r.date).toISOString().slice(0, 10);
        return rDate === todayStr;
      });
      setTodayRecord(found || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    setError('');
    setMsg('');
    try {
      const res = await axios.post('/api/attendance/check-in');
      setMsg(res.data.message);
      fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setMsg('');
    try {
      const res = await axios.post('/api/attendance/check-out');
      setMsg(res.data.message);
      fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Daily Attendance Action Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            Daily Attendance
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {todayRecord && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '0.88rem' }}>
              <span style={{ color: '#10b981' }}>
                <strong>In:</strong> {todayRecord.checkInTime || '--'}
              </span>
              <span style={{ color: '#3b82f6' }}>
                <strong>Out:</strong> {todayRecord.checkOutTime || '--'}
              </span>
              <span className={`badge badge-${todayRecord.status.toLowerCase()}`}>
                {todayRecord.status}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCheckIn}
            disabled={todayRecord !== null}
            className={`btn ${todayRecord ? 'btn-secondary' : 'btn-success'}`}
          >
            <LogIn size={16} /> Check In
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!todayRecord || todayRecord.checkOutTime}
            className={`btn ${!todayRecord || todayRecord.checkOutTime ? 'btn-secondary' : 'btn-primary'}`}
          >
            <LogOut size={16} /> Check Out
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {msg}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Attendance History Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
          Attendance History
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
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

export default Attendance;
