import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import AddDataForm from './pages/AddData/AddDataForm';
import AlertsPanel from './pages/Alerts/AlertsPanel';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import PatientLookup from './pages/PatientLookup/PatientLookup';
import UserManagement from './pages/Admin/UserManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { useHealthData } from './context/HealthDataContext';

// ── Patient Lookup Gate ──────────────────────────────────────────────────────
// Shows the PatientLookup page until a patient is selected.
// - Admin/CareManager: Bypass (Global Access)
// - Parent/Child: Requirement (Must search via ID)
const PatientLookupGate = ({ children }) => {
  const { user, token, logout } = useAuth();
  const { patientInfo, switchPatient } = useHealthData();

  // Admin and Care Manager are most powerful and bypass the lookup gate
  if (user?.role === 'admin' || user?.role === 'caremanager') return children;

  // Parents and Children must find their specific patient record
  if (patientInfo) return children;

  return (
    <PatientLookup
      token={token}
      onFound={(patient) => switchPatient(patient)}
      onLogout={logout}
    />
  );
};

// ── Protected route wrapper ───────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
      Loading session...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <HealthDataProvider>
      {children}
    </HealthDataProvider>
  );
};

// ── Layout with the Patient Lookup gate applied ──────────────────────────────
const GatedLayout = () => (
  <PatientLookupGate>
    <Layout />
  </PatientLookupGate>
);

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
      Loading app...
    </div>
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"                element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register"             element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password"      element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/reset-password/:token" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />

      {/* Protected + gated routes */}
      <Route path="/" element={<ProtectedRoute><GatedLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="add-data"   element={<AddDataForm />} />
        <Route path="alerts"     element={<AlertsPanel />} />
        <Route path="admin/users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
