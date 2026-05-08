import { useState, useEffect } from 'react';
import api from '../../api';

export default function StockView() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/inventory').then(r => setMedicines(r.data.medicines)).finally(() => setLoading(false));
  }, []);

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : filter === 'low' ? m.quantity <= m.threshold : filter === 'out' ? m.quantity === 0 : true;
    return matchSearch && matchFilter;
  });

  const stockBadge = (m) => {
    if (m.quantity === 0) return <span className="badge badge-danger">Out of stock</span>;
    if (m.quantity <= m.threshold) return <span className="badge badge-warning">Low stock</span>;
    return <span className="badge badge-success">In stock</span>;
  };

  const lowCount = medicines.filter(m => m.quantity <= m.threshold && m.quantity > 0).length;
  const outCount = medicines.filter(m => m.quantity === 0).length;

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>Medicine Stock</h1>
        <p>Current inventory levels</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total medicines</div><div className="stat-value blue">{medicines.length}</div></div>
        <div className="stat-card"><div className="stat-label">Low stock</div><div className="stat-value orange">{lowCount}</div></div>
        <div className="stat-card"><div className="stat-label">Out of stock</div><div className="stat-value red">{outCount}</div></div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search medicines..." style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'low', 'out'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                {f === 'all' ? 'All' : f === 'low' ? 'Low stock' : 'Out of stock'}
              </button>
            ))}
          </div>
        </div>
        {loading ? <div className="loading">Loading...</div> : filtered.length === 0 ? (
          <div className="empty-state"><p>No medicines found</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Medicine</th><th>Category</th><th>Quantity</th><th>Threshold</th><th>Expiry</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id} style={{ background: m.quantity === 0 ? '#fef2f2' : m.quantity <= m.threshold ? '#fffbeb' : 'transparent' }}>
                  <td><strong>{m.name}</strong>{m.manufacturer && <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.manufacturer}</div>}</td>
                  <td style={{ textTransform: 'capitalize' }}>{m.category}</td>
                  <td><strong>{m.quantity}</strong> <span style={{ fontSize: 12, color: '#9ca3af' }}>{m.unit}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: 13 }}>{m.threshold}</td>
                  <td style={{ fontSize: 13 }}>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '-'}</td>
                  <td>{stockBadge(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
