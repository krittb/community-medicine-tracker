import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary').then(r => setSummary(r.data.summary)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header"><h1>Admin Dashboard</h1><p>System overview</p></div>
      {loading ? <div className="loading">Loading...</div> : summary && (
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Total patients</div><div className="stat-value blue">{summary.totalPatients}</div></div>
          <div className="stat-card"><div className="stat-label">Total doctors</div><div className="stat-value green">{summary.totalDoctors}</div></div>
          <div className="stat-card"><div className="stat-label">Today's appointments</div><div className="stat-value blue">{summary.todayAppointments}</div></div>
          <div className="stat-card"><div className="stat-label">Medicines in system</div><div className="stat-value green">{summary.totalMedicines}</div></div>
          <div className="stat-card"><div className="stat-label">Low stock alerts</div><div className="stat-value orange">{summary.lowStockMedicines}</div></div>
          <div className="stat-card"><div className="stat-label">Pending Rx</div><div className="stat-value red">{summary.pendingPrescriptions}</div></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/admin/inventory" className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center', color: '#111827' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
          <strong>Manage Inventory</strong>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Add, edit, remove medicines</p>
        </Link>
        <Link to="/admin/analytics" className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center', color: '#111827' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <strong>Analytics</strong>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Weekly stats, top medicines, stock</p>
        </Link>
      </div>
    </div>
  );
}
