import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { patient: '/patient', doctor: '/doctor', pharmacist: '/pharmacist', admin: '/admin' };

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Community Medicine Tracker</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 14, color: '#6b7280' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <div style={{ marginTop: '1rem', padding: '12px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#6b7280' }}>
          <strong>Demo credentials:</strong><br />
          Patient: patient@demo.com / password123<br />
          Doctor: doctor@demo.com / password123<br />
          Pharmacist: pharma@demo.com / password123<br />
          Admin: admin@demo.com / password123
        </div>
      </div>
    </div>
  );
}
