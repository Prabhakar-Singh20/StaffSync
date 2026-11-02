import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, trainRes] = await Promise.all([
          axios.get('/api/announcements'),
          axios.get('/api/trainings'),
        ]);
        setAnnouncements(annRes.data);
        setTrainings(trainRes.data);
      } catch (err) {
        console.error('Failed to load announcements/trainings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ color: '#9ca3af', padding: '24px' }}>Loading company updates...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Announcements Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Bell size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff' }}>Company Announcements</h3>
        </div>

        {announcements.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No announcements available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map((item) => (
              <div
                key={item._id}
                style={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f3f4f6' }}>{item.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#d1d5db', lineHeight: '1.5' }}>{item.message}</p>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#6b7280' }}>
                  Posted by: {item.postedBy?.name || 'Management'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trainings Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <BookOpen size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff' }}>Trainings & Workshops</h3>
        </div>

        {trainings.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No training sessions scheduled.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trainings.map((prog) => (
              <div
                key={prog._id}
                style={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f3f4f6' }}>{prog.title}</h4>
                  <span className="badge badge-role">{prog.targetDepartment}</span>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#d1d5db', lineHeight: '1.5', marginBottom: '12px' }}>
                  {prog.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Trainer: <strong style={{ color: '#e5e7eb' }}>{prog.trainer}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {new Date(prog.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
