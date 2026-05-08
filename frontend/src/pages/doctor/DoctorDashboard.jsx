// DoctorDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export function DoctorDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/appointments/queue?date=${today}`).then(r => setQueue(r.data.appointments)).finally(() => setLoading(false));
  }, []);

  const waiting = queue.filter(a => a.status === 'scheduled').length;
  const inProgress = queue.filter(a => a.status === 'in-consultation').length;
  const done = queue.filter(a => a.status === 'completed').length;

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>Good day, Dr. {user.name}</h1>
        <p>Today is {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Waiting</div><div className="stat-value orange">{waiting}</div></div>
        <div className="stat-card"><div className="stat-label">In consultation</div><div className="stat-value blue">{inProgress}</div></div>
        <div className="stat-card"><div className="stat-label">Completed today</div><div className="stat-value green">{done}</div></div>
        <div className="stat-card"><div className="stat-label">Total today</div><div className="stat-value blue">{queue.length}</div></div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Today's queue</h2>
          <Link to="/doctor/queue" className="btn btn-primary btn-sm">View full queue →</Link>
        </div>
        {loading ? <div className="loading">Loading...</div> : queue.length === 0 ? (
          <div className="empty-state"><p>No patients scheduled today</p></div>
        ) : queue.slice(0, 5).map(a => (
          <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <strong style={{ fontSize: 14 }}>#{a.tokenNumber} — {a.patient?.name}</strong>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.timeSlot}</div>
            </div>
            <span className={`badge ${a.status === 'scheduled' ? 'badge-info' : a.status === 'in-consultation' ? 'badge-warning' : 'badge-success'}`}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
