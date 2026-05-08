import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { patient: '/patient', doctor: '/doctor', pharmacist: '/pharmacist', admin: '/admin' };

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '', age: '', gender: 'male', specialization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create Account</h1>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91..." />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" value={form.age} onChange={e => set('age', e.target.value)} min={0} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {form.role === 'doctor' && (
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Specialization</label>
                <input value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="e.g. General Physician" />
              </div>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
