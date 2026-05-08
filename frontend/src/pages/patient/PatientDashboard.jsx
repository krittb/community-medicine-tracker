import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const statusBadge = { scheduled: 'badge-info', 'in-consultation': 'badge-warning', completed: 'badge-success', cancelled: 'badge-gray' };

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/my').then(r => setAppointments(r.data.appointments)).finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'scheduled');
  const recent = appointments.filter(a => a.status !== 'scheduled').slice(0, 5);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>Welcome, {user.name}</h1>
        <p>Your health dashboard</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Upcoming appointments</div><div className="stat-value blue">{upcoming.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total visits</div><div className="stat-value green">{appointments.filter(a => a.status === 'completed').length}</div></div>
        <div className="stat-card"><div className="stat-label">Cancelled</div><div className="stat-value red">{appointments.filter(a => a.status === 'cancelled').length}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Upcoming appointments</h2>
            <Link to="/patient/book" className="btn btn-primary btn-sm">+ Book new</Link>
          </div>
          {loading ? <div className="loading">Loading...</div> : upcoming.length === 0 ? (
            <div className="empty-state"><p>No upcoming appointments</p><Link to="/patient/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>Book now</Link></div>
          ) : upcoming.map(a => (
            <div key={a._id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 14 }}>Dr. {a.doctor?.name}</strong>
                <span className={`badge ${statusBadge[a.status]}`}>{a.status}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                {a.date} at {a.timeSlot} — Token #{a.tokenNumber}
              </div>
              {a.doctor?.specialization && <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.doctor.specialization}</div>}
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent visits</h2>
            <Link to="/patient/prescriptions" style={{ fontSize: 13, color: '#2563eb' }}>View Rx →</Link>
          </div>
          {recent.length === 0 ? <div className="empty-state"><p>No past visits yet</p></div> : recent.map(a => (
            <div key={a._id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 14 }}>Dr. {a.doctor?.name}</strong>
                <span className={`badge ${statusBadge[a.status]}`}>{a.status}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
