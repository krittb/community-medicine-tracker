import { useState, useEffect } from 'react';
import api from '../../api';

const statusBadge = { scheduled: 'badge-info', 'in-consultation': 'badge-warning', completed: 'badge-success', cancelled: 'badge-gray' };

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  const load = () => api.get('/appointments/my').then(r => setAppointments(r.data.appointments)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    load();
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>All your appointments history</p>
      </div>
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : appointments.length === 0 ? (
          <div className="empty-state"><p>No appointments found</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th><th>Date</th><th>Time</th><th>Token</th><th>Status</th><th>Symptoms</th><th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a._id}>
                  <td><strong>{a.doctor?.name}</strong><br /><span style={{ fontSize: 12, color: '#9ca3af' }}>{a.doctor?.specialization}</span></td>
                  <td>{a.date}</td>
                  <td>{a.timeSlot}</td>
                  <td><span className="badge badge-info">#{a.tokenNumber}</span></td>
                  <td><span className={`badge ${statusBadge[a.status]}`}>{a.status}</span></td>
                  <td style={{ maxWidth: 200, fontSize: 13 }}>{a.symptoms || '-'}</td>
                  <td>{a.status === 'scheduled' && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(a._id)}>Cancel</button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
