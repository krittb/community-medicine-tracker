import { useState, useEffect } from 'react';
import api from '../../api';

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/prescriptions/my').then(r => setPrescriptions(r.data.prescriptions)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>My Prescriptions</h1>
        <p>Click any row to view medicine details</p>
      </div>
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : prescriptions.length === 0 ? (
          <div className="empty-state"><p>No prescriptions yet</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Status</th></tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?._id === p._id ? null : p)}>
                  <td>{p.appointment?.date || new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{p.doctor?.name}</td>
                  <td>{p.diagnosis || '-'}</td>
                  <td>{p.medicines?.length} medicine(s)</td>
                  <td><span className={`badge ${p.dispensed ? 'badge-success' : 'badge-warning'}`}>{p.dispensed ? 'Dispensed' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 16 }}>Prescription detail</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
          {selected.diagnosis && <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Diagnosis:</strong> {selected.diagnosis}</p>}
          {selected.instructions && <p style={{ fontSize: 14, marginBottom: '1rem', color: '#6b7280' }}>{selected.instructions}</p>}
          <table className="table">
            <thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Quantity</th></tr></thead>
            <tbody>
              {selected.medicines?.map((m, i) => (
                <tr key={i}><td>{m.medicineName}</td><td>{m.dosage}</td><td>{m.duration}</td><td>{m.quantity}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
