import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/prescriptions/pending'),
      api.get('/inventory?lowStock=true')
    ]).then(([p, s]) => {
      setPending(p.data.prescriptions);
      setLowStock(s.data.medicines);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>Welcome, {user.name}</h1>
        <p>Pharmacist dashboard</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Pending dispense</div><div className="stat-value orange">{pending.length}</div></div>
        <div className="stat-card"><div className="stat-label">Low / out of stock</div><div className="stat-value red">{lowStock.length}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Pending prescriptions</h2>
            <Link to="/pharmacist/dispense" className="btn btn-primary btn-sm">Go to dispense →</Link>
          </div>
          {loading ? <div className="loading">Loading...</div> : pending.length === 0
            ? <div className="empty-state"><p>All caught up!</p></div>
            : pending.slice(0, 5).map(p => (
              <div key={p._id} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <strong style={{ fontSize: 14 }}>{p.patient?.name}</strong>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.medicines?.length} medicine(s) — Dr. {p.doctor?.name}</div>
              </div>
            ))}
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Stock alerts</h2>
            <Link to="/pharmacist/stock" className="btn btn-outline btn-sm">View all →</Link>
          </div>
          {loading ? <div className="loading">Loading...</div> : lowStock.length === 0
            ? <div className="empty-state"><p>All stocks adequate</p></div>
            : lowStock.map(m => (
              <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 14 }}>{m.name}</span>
                <span className={`badge ${m.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>{m.quantity === 0 ? 'Out' : `${m.quantity} left`}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
