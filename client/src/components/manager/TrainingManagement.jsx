import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';

const TrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainer, setTrainer] = useState('');
  const [date, setDate] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('All');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchTrainings = async () => {
    try {
      const res = await axios.get('/api/trainings');
      setTrainings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      await axios.post('/api/trainings', {
        title,
        description,
        trainer,
        date,
        targetDepartment,
      });
      setMsg('Training program created and scheduled!');
      setTitle('');
      setDescription('');
      setTrainer('');
      setDate('');
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create training');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training module?')) return;
    try {
      await axios.delete(`/api/trainings/${id}`);
      setMsg('Training session deleted');
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Create Training Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff', marginBottom: '18px' }}>
          Schedule Training Program
        </h3>

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
            <label className="form-label">Training Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MongoDB CRUD"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. This Training Session is based on MongoDB CRUD Operation."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Trainer Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Adnan Saif"
                value={trainer}
                onChange={(e) => setTrainer(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Department</label>
            <select
              className="form-select"
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Training & Development">Training & Development</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <Plus size={16} /> Schedule Session
          </button>
        </form>
      </div>

      {/* Existing Training Modules */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#ffffff', marginBottom: '18px' }}>
          Active Training Programs ({trainings.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto' }}>
          {trainings.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No training programs active.</p>
          ) : (
            trainings.map((t) => (
              <div
                key={t._id}
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
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>{t.title}</h4>
                    <span className="badge badge-role">{t.targetDepartment}</span>
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '0.86rem', lineHeight: '1.4', marginBottom: '8px' }}>
                    {t.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#9ca3af' }}>
                    <span>Trainer: <strong style={{ color: '#ffffff' }}>{t.trainer}</strong></span>
                    <span>Date: {new Date(t.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="btn btn-danger btn-sm"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingManagement;
