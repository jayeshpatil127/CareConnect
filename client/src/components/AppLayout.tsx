import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, HeartPulse, Calendar, Activity, ClipboardList, Pill, User as UserIcon, Users, Settings, ActivitySquare } from 'lucide-react';

export const AppLayout = ({ allowedRole }: { allowedRole: string }) => {
  const { user, isLoading, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/patient', label: 'Overview', icon: HeartPulse, end: true },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/vitals', label: 'Vitals', icon: Activity },
    { to: '/patient/history', label: 'Medical History', icon: ClipboardList },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
    { to: '/patient/profile', label: 'Profile', icon: UserIcon },
  ];

  const doctorLinks = [
    { to: '/doctor', label: 'Overview', icon: HeartPulse, end: true },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/patients', label: 'Patients', icon: Users },
    { to: '/doctor/notes', label: 'Clinical Notes', icon: ClipboardList },
    { to: '/doctor/profile', label: 'Profile', icon: UserIcon },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: ActivitySquare, end: true },
    { to: '/admin/doctors', label: 'Doctors', icon: HeartPulse },
    { to: '/admin/patients', label: 'Patients', icon: Users },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/logs', label: 'Audit Logs', icon: ClipboardList },
  ];

  const links = user.role === 'patient' ? patientLinks : user.role === 'doctor' ? doctorLinks : adminLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <HeartPulse className="w-6 h-6" /> CareConnect
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-16 hidden md:flex items-center gap-2 px-6 border-b border-gray-100 text-blue-600 font-bold text-xl">
          <HeartPulse className="w-6 h-6" /> CareConnect
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-gray-900 truncate">{user.fullName}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-0 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Topbar (Desktop only) */}
        <div className="h-16 hidden md:flex items-center justify-between px-8 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="text-sm text-gray-500 font-medium capitalize">
            {user.role} Portal
          </div>
          <div className="flex items-center gap-4">
             {/* Notification icon placeholder if needed */}
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};