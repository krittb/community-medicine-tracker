import { useState, useEffect } from 'react';
import api from '../../api';

const CATEGORIES = ['antibiotic','analgesic','antiviral','antifungal','antacid','antihistamine','vitamin','supplement','other'];
const empty = { name:'', category:'other', description:'', quantity:0, unit:'tablets', threshold:10, manufacturer:'', price:'', expiryDate:'' };

export default function InventoryManager() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/inventory').then(r => setMedicines(r.data.medicines)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditing(null); setError(''); setShowModal(true); };
  const openEdit = (m) => {
    setForm({ ...m, expiryDate: m.expiryDate ? m.expiryDate.split('T')[0] : '', price: m.price || '' });
    setEditing(m._id); setError(''); setShowModal(true);
  };

  const save = async () => {
    setError(''); setSaving(true);
    try {
      if (editing) {
        await api.put(`/inventory/${editing}`, form);
        setSuccess('Medicine updated');
      } else {
        await api.post('/inventory', form);
        setSuccess('Medicine added');
      }
      setShowModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const deactivate = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from inventory?`)) return;
    await api.delete(`/inventory/${id}`);
    setSuccess('Medicine removed'); load();
  };

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Inventory Management</h1>
          <p>Add, edit, and manage medicines</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Medicine</button>
      </div>
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}
      <div className="card">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search medicines..." style={{ width: '100%', maxWidth: 320, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: '1rem' }} />
        {loading ? <div className="loading">Loading...</div> : filtered.length === 0 ? (
          <div className="empty-state"><p>No medicines found</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Qty</th><th>Threshold</th><th>Expiry</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id}>
                  <td><strong>{m.name}</strong><div style={{ fontSize: 12, color: '#9ca3af' }}>{m.manufacturer}</div></td>
                  <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{m.category}</td>
                  <td>{m.quantity} <span style={{ fontSize: 11, color: '#9ca3af' }}>{m.unit}</span></td>
                  <td style={{ fontSize: 13, color: '#9ca3af' }}>{m.threshold}</td>
                  <td style={{ fontSize: 13 }}>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '-'}</td>
                  <td style={{ fontSize: 13 }}>{m.price ? `₹${m.price}` : '-'}</td>
                  <td>
                    {m.quantity === 0 ? <span className="badge badge-danger">Out</span>
                      : m.quantity <= m.threshold ? <span className="badge badge-warning">Low</span>
                      : <span className="badge badge-success">OK</span>}
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deactivate(m._id, m.name)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2>{editing ? 'Edit Medicine' : 'Add New Medicine'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Medicine Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Paracetamol 500mg" />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="tablets / ml / capsules" />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input type="number" value={form.quantity} min={0} onChange={e => set('quantity', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Low-stock threshold</label>
                <input type="number" value={form.threshold} min={0} onChange={e => set('threshold', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" value={form.price} min={0} onChange={e => set('price', e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Medicine'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
