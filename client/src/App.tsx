import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient
import PatientOverview from './pages/patient/Overview';
import PatientAppointments from './pages/patient/Appointments';
import PatientVitals from './pages/patient/Vitals';
import PatientMedicalHistory from './pages/patient/MedicalHistory';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientProfile from './pages/patient/Profile';

// Doctor
import DoctorOverview from './pages/doctor/Overview';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorNotes from './pages/doctor/Notes';
import DoctorProfile from './pages/doctor/Profile';

// Admin
import AdminOverview from './pages/admin/Overview';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<AppLayout allowedRole="patient" />}>
            <Route index element={<PatientOverview />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="vitals" element={<PatientVitals />} />
            <Route path="history" element={<PatientMedicalHistory />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={<AppLayout allowedRole="doctor" />}>
            <Route index element={<DoctorOverview />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="notes" element={<DoctorNotes />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="*" element={<DoctorOverview />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AppLayout allowedRole="admin" />}>
            <Route index element={<AdminOverview />} />
            <Route path="*" element={<AdminOverview />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;