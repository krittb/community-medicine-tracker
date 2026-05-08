import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyPrescriptions from './pages/patient/MyPrescriptions';

import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import DoctorQueue from './pages/doctor/DoctorQueue';

import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import DispenseView from './pages/pharmacist/DispenseView';
import StockView from './pages/pharmacist/StockView';

import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManager from './pages/admin/InventoryManager';
import Analytics from './pages/admin/Analytics';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const map = { patient: '/patient', doctor: '/doctor', pharmacist: '/pharmacist', admin: '/admin' };
  return <Navigate to={map[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute roles={['patient']}><MyPrescriptions /></ProtectedRoute>} />

          <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/queue" element={<ProtectedRoute roles={['doctor']}><DoctorQueue /></ProtectedRoute>} />

          <Route path="/pharmacist" element={<ProtectedRoute roles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
          <Route path="/pharmacist/dispense" element={<ProtectedRoute roles={['pharmacist']}><DispenseView /></ProtectedRoute>} />
          <Route path="/pharmacist/stock" element={<ProtectedRoute roles={['pharmacist']}><StockView /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute roles={['admin']}><InventoryManager /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
