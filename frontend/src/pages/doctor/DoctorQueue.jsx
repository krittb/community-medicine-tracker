import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const statusBadge = { scheduled: 'badge-info', 'in-consultation': 'badge-warning', completed: 'badge-success', cancelled: 'badge-gray' };

export default function DoctorQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [rxForm, setRxForm] = useState({ diagnosis: '', instructions: '', items: [{ medicine: '', medicineName: '', dosage: '', duration: '', quantity: 1 }] });
  const [allMeds, setAllMeds] = useState([]);
  const [rxError, setRxError] = useState('');
  const [rxSuccess, setRxSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/appointments/queue?date=${date}`).then(r => setQueue(r.data.appointments)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);
  useEffect(() => { api.get('/inventory').then(r => setAllMeds(r.data.medicines)); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}/status`, { status });
    load();
    if (status === 'in-consultation') {
      const appt = queue.find(a => a._id === id);
      setSelected(appt);
    }
  };

  const addRxItem = () => setRxForm(f => ({ ...f, items: [...f.items, { medicine: '', medicineName: '', dosage: '', duration: '', quantity: 1 }] }));
  const removeRxItem = (i) => setRxForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const setRxItem = (i, k, v) => setRxForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    if (k === 'medicine') {
      const med = allMeds.find(m => m._id === v);
      items[i].medicineName = med?.name || '';
    }
    return { ...f, items };
  });

  const submitRx = async () => {
    setRxError(''); setRxSuccess('');
    try {
      await api.post('/prescriptions', {
        appointmentId: selected._id,
        medicines: rxForm.items.map(i => ({ medicine: i.medicine, dosage: i.dosage, duration: i.duration, quantity: Number(i.quantity) })),
        diagnosis: rxForm.diagnosis,
        instructions: rxForm.instructions
      });
      setRxSuccess('Prescription saved! Appointment marked completed.');
      setSelected(null);
      setRxForm({ diagnosis: '', instructions: '', items: [{ medicine: '', medicineName: '', dosage: '', duration: '', quantity: 1 }] });
      load();
    } catch (err) { setRxError(err.response?.data?.message || 'Failed to save prescription'); }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Patient Queue</h1>
          <p>Dr. {user.name}</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
      </div>
      {rxSuccess && <div className="alert alert-success">{rxSuccess}</div>}
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : queue.length === 0 ? (
          <div className="empty-state"><p>No patients scheduled for this date</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>Token</th><th>Patient</th><th>Age / Gender</th><th>Time</th><th>Symptoms</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {queue.map(a => (
                <tr key={a._id}>
                  <td><span className="badge badge-info">#{a.tokenNumber}</span></td>
                  <td><strong>{a.patient?.name}</strong><br /><span style={{ fontSize: 12, color: '#9ca3af' }}>{a.patient?.phone}</span></td>
                  <td style={{ fontSize: 13 }}>{a.patient?.age || '-'} / {a.patient?.gender || '-'}</td>
                  <td>{a.timeSlot}</td>
                  <td style={{ fontSize: 13, maxWidth: 160 }}>{a.symptoms || '-'}</td>
                  <td><span className={`badge ${statusBadge[a.status]}`}>{a.status}</span></td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {a.status === 'scheduled' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'in-consultation')}>Start</button>}
                    {a.status === 'in-consultation' && <button className="btn btn-success btn-sm" onClick={() => setSelected(a)}>Write Rx</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <h2>Prescription for {selected.patient?.name}</h2>
            {rxError && <div className="alert alert-error">{rxError}</div>}
            <div className="form-group">
              <label>Diagnosis</label>
              <input value={rxForm.diagnosis} onChange={e => setRxForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Acute pharyngitis" />
            </div>
            <div className="form-group">
              <label>Instructions</label>
              <textarea value={rxForm.instructions} onChange={e => setRxForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Take with food, drink plenty of water..." />
            </div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 8 }}>Medicines</label>
            {rxForm.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                <div>
                  {i === 0 && <label style={{ fontSize: 12, color: '#6b7280' }}>Medicine</label>}
                  <select value={item.medicine} onChange={e => setRxItem(i, 'medicine', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
                    <option value="">Select...</option>
                    {allMeds.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  {i === 0 && <label style={{ fontSize: 12, color: '#6b7280' }}>Dosage</label>}
                  <input value={item.dosage} onChange={e => setRxItem(i, 'dosage', e.target.value)} placeholder="1 tablet twice daily" style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  {i === 0 && <label style={{ fontSize: 12, color: '#6b7280' }}>Duration</label>}
                  <input value={item.duration} onChange={e => setRxItem(i, 'duration', e.target.value)} placeholder="5 days" style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  {i === 0 && <label style={{ fontSize: 12, color: '#6b7280' }}>Qty</label>}
                  <input type="number" value={item.quantity} min={1} onChange={e => setRxItem(i, 'quantity', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeRxItem(i)} style={{ marginTop: i === 0 ? 18 : 0 }}>×</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={addRxItem} style={{ marginBottom: '1rem' }}>+ Add medicine</button>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRx}>Save Prescription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
