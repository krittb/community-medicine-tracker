import { useState, useEffect } from 'react';
import api from '../../api';

export default function DispenseView() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dispensing, setDispensing] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/prescriptions/pending').then(r => setPrescriptions(r.data.prescriptions)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const dispense = async () => {
    setError(''); setDispensing(true);
    try {
      await api.put(`/prescriptions/${selected._id}/dispense`, { remarks });
      setSuccess(`Prescription for ${selected.patient?.name} dispensed successfully!`);
      setSelected(null);
      setRemarks('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispense');
    } finally { setDispensing(false); }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div className="page-header">
        <h1>Pending Dispensing</h1>
        <p>Prescriptions awaiting medicine dispensing</p>
      </div>
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : prescriptions.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40 }}>✅</div>
            <p style={{ marginTop: 8, fontWeight: 500 }}>All caught up!</p>
            <p>No pending prescriptions to dispense.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Medicines</th><th>Diagnosis</th><th></th></tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.patient?.name}</strong><br /><span style={{ fontSize: 12, color: '#9ca3af' }}>Age: {p.patient?.age || '-'}</span></td>
                  <td>{p.doctor?.name}</td>
                  <td>{p.appointment?.date || new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{p.medicines?.length} item(s)</td>
                  <td style={{ fontSize: 13 }}>{p.diagnosis || '-'}</td>
                  <td><button className="btn btn-primary btn-sm" onClick={() => { setSelected(p); setError(''); }}>Dispense</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <h2>Dispense — {selected.patient?.name}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px', marginBottom: '1rem' }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}><strong>Diagnosis:</strong> {selected.diagnosis || 'N/A'}</p>
              {selected.instructions && <p style={{ fontSize: 13, color: '#6b7280' }}><strong>Instructions:</strong> {selected.instructions}</p>}
            </div>
            <table className="table" style={{ marginBottom: '1rem' }}>
              <thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Qty to Dispense</th></tr></thead>
              <tbody>
                {selected.medicines?.map((m, i) => (
                  <tr key={i}>
                    <td><strong>{m.medicineName}</strong></td>
                    <td style={{ fontSize: 13 }}>{m.dosage}</td>
                    <td style={{ fontSize: 13 }}>{m.duration}</td>
                    <td><span className="badge badge-info">{m.quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="form-group">
              <label>Remarks (optional)</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any notes about dispensing..." rows={2} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-success" onClick={dispense} disabled={dispensing}>
                {dispensing ? 'Processing...' : 'Confirm Dispense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
