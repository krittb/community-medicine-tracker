import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', symptoms: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api.get('/appointments/doctors').then(r => setDoctors(r.data.doctors)); }, []);

  useEffect(() => {
    if (form.doctorId && form.date) {
      api.get(`/appointments/slots/${form.doctorId}/${form.date}`).then(r => setSlots(r.data.available));
      setForm(f => ({ ...f, timeSlot: '' }));
    }
  }, [form.doctorId, form.date]);

  const today = new Date().toISOString().split('T')[0];

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/appointments', form);
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/patient/appointments'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: 600 }}>
      <div className="page-header">
        <h1>Book Appointment</h1>
        <p>Select a doctor and available time slot</p>
      </div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Select Doctor</label>
            <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} required>
              <option value="">-- Choose a doctor --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>{d.name}{d.specialization ? ` — ${d.specialization}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} min={today} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          {form.doctorId && form.date && (
            <div className="form-group">
              <label>Available Time Slots</label>
              {slots.length === 0 ? (
                <p style={{ color: '#dc2626', fontSize: 14 }}>No slots available for this date.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {slots.map(slot => (
                    <button key={slot} type="button"
                      onClick={() => setForm(f => ({ ...f, timeSlot: slot }))}
                      style={{
                        padding: '6px 14px', borderRadius: 6, border: '1px solid',
                        borderColor: form.timeSlot === slot ? '#2563eb' : '#d1d5db',
                        background: form.timeSlot === slot ? '#eff6ff' : '#fff',
                        color: form.timeSlot === slot ? '#2563eb' : '#374151',
                        cursor: 'pointer', fontSize: 13
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Symptoms / Reason for visit</label>
            <textarea value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} placeholder="Describe your symptoms..." />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading || !form.timeSlot}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
