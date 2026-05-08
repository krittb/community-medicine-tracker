import { useState, useEffect } from 'react';
import api from '../../api';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [topMeds, setTopMeds] = useState([]);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/appointments/weekly'),
      api.get('/analytics/medicines/top'),
      api.get('/analytics/stock')
    ]).then(([s, w, t, st]) => {
      setSummary(s.data.summary);
      setWeekly(w.data.data);
      setTopMeds(t.data.data);
      setStock(st.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading" style={{ marginTop: '3rem' }}>Loading analytics...</div>;

  const maxWeekly = Math.max(...weekly.map(d => d.count), 1);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>System-wide overview</p>
      </div>

      {summary && (
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Total patients</div><div className="stat-value blue">{summary.totalPatients}</div></div>
          <div className="stat-card"><div className="stat-label">Total doctors</div><div className="stat-value green">{summary.totalDoctors}</div></div>
          <div className="stat-card"><div className="stat-label">Today's appointments</div><div className="stat-value blue">{summary.todayAppointments}</div></div>
          <div className="stat-card"><div className="stat-label">Medicines in stock</div><div className="stat-value green">{summary.totalMedicines}</div></div>
          <div className="stat-card"><div className="stat-label">Low stock alerts</div><div className="stat-value orange">{summary.lowStockMedicines}</div></div>
          <div className="stat-card"><div className="stat-label">Pending prescriptions</div><div className="stat-value red">{summary.pendingPrescriptions}</div></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Weekly appointments (last 7 days)</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {weekly.map(d => (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#6b7280' }}>{d.count}</span>
                <div style={{
                  width: '100%', background: '#2563eb', borderRadius: '4px 4px 0 0',
                  height: `${Math.max((d.count / maxWeekly) * 90, d.count > 0 ? 8 : 2)}px`,
                  opacity: d.count === 0 ? 0.2 : 1, transition: 'height 0.3s'
                }} />
                <span style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>
                  {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Top prescribed medicines</h2>
          {topMeds.length === 0 ? <div className="empty-state"><p>No prescription data yet</p></div> : (
            <div>
              {topMeds.slice(0, 6).map((m, i) => {
                const max = topMeds[0]?.count || 1;
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{m._id}</span><span style={{ color: '#6b7280' }}>{m.count}</span>
                    </div>
                    <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999 }}>
                      <div style={{ height: '100%', background: '#2563eb', borderRadius: 999, width: `${(m.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {stock && (
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Stock status breakdown</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-danger">Out of stock ({stock.critical?.length})</span>
              </div>
              {stock.critical?.length === 0 ? <p style={{ fontSize: 13, color: '#9ca3af' }}>None</p> :
                stock.critical?.map(m => <div key={m._id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>{m.name}</div>)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-warning">Low stock ({stock.low?.length})</span>
              </div>
              {stock.low?.length === 0 ? <p style={{ fontSize: 13, color: '#9ca3af' }}>None</p> :
                stock.low?.map(m => <div key={m._id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>{m.name} — {m.quantity} left</div>)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-success">Adequate ({stock.adequate?.length})</span>
              </div>
              {stock.adequate?.slice(0, 6).map(m => <div key={m._id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>{m.name}</div>)}
              {stock.adequate?.length > 6 && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>+{stock.adequate.length - 6} more</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
