import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  patient: [
    { to: '/patient', label: 'Dashboard' },
    { to: '/patient/book', label: 'Book Appointment' },
    { to: '/patient/appointments', label: 'My Appointments' },
    { to: '/patient/prescriptions', label: 'My Prescriptions' }
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard' },
    { to: '/doctor/queue', label: 'Queue' }
  ],
  pharmacist: [
    { to: '/pharmacist', label: 'Dashboard' },
    { to: '/pharmacist/dispense', label: 'Dispense' },
    { to: '/pharmacist/stock', label: 'Stock' }
  ],
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/analytics', label: 'Analytics' }
  ]
};

const roleBadgeColor = { patient: '#2563eb', doctor: '#16a34a', pharmacist: '#d97706', admin: '#7c3aed' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 1rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 16, color: '#111827', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Community Medicine
        </Link>
        <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {user && roleLinks[user.role]?.map(l => (
            <Link key={l.to} to={l.to}
              style={{ padding: '6px 12px', borderRadius: 6, fontSize: 14, color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.background = '#f3f4f6'}
              onMouseLeave={e => e.target.style.background = 'transparent'}>
              {l.label}
            </Link>
          ))}
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{user.name}</span>
            <span style={{ background: roleBadgeColor[user.role], color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 11, textTransform: 'capitalize' }}>
              {user.role}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
