import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, HeartPulse, Calendar, Activity, ClipboardList, Pill, User as UserIcon, Users, Settings, ActivitySquare } from 'lucide-react';

export const AppLayout = ({ allowedRole }: { allowedRole: string }) => {
  const { user, isLoading, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabletSidebarExpanded, setIsTabletSidebarExpanded] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsTabletSidebarExpanded(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

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
  const pageTitle = links.find((link) => link.end
    ? location.pathname === link.to
    : location.pathname.startsWith(link.to))?.label || `${user.role} overview`;

  const toggleNavigation = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setIsTabletSidebarExpanded((expanded) => !expanded);
      return;
    }
    setIsMobileMenuOpen((open) => !open);
  };

  const closeNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsTabletSidebarExpanded(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-gray-950/35 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 -translate-x-full flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isTabletSidebarExpanded ? 'md:w-64' : 'md:w-[4.5rem]'} lg:w-64 ${isMobileMenuOpen ? 'translate-x-0' : ''}`}>
        <div className={`flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 px-5 text-xl font-bold text-blue-700 ${isTabletSidebarExpanded ? 'md:justify-start' : 'md:justify-center lg:justify-start'}`}>
          <HeartPulse className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span className={isTabletSidebarExpanded ? 'md:inline' : 'md:hidden lg:inline'}>CareConnect</span>
        </div>

        <nav aria-label="Main navigation" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <div className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 ${isTabletSidebarExpanded ? 'md:block' : 'md:hidden lg:block'}`}>Navigation</div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeNavigation}
                title={isTabletSidebarExpanded ? undefined : link.label}
                className={({ isActive }) => `
                  flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${isTabletSidebarExpanded ? 'md:justify-start' : 'md:justify-center lg:justify-start'}
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={isTabletSidebarExpanded ? 'md:inline' : 'md:hidden lg:inline'}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-3 sm:p-4">
          <div className={`mb-2 flex items-center gap-3 px-2 py-2 ${isTabletSidebarExpanded ? 'md:justify-start' : 'md:justify-center lg:justify-start'}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {user.fullName.charAt(0)}
            </div>
            <div className={`min-w-0 flex-1 overflow-hidden ${isTabletSidebarExpanded ? 'md:block' : 'md:hidden lg:block'}`}>
              <div className="truncate text-sm font-medium text-gray-900">{user.fullName}</div>
              <div className="truncate text-xs capitalize text-gray-500">{user.role}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={isTabletSidebarExpanded ? undefined : 'Log out'}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${isTabletSidebarExpanded ? 'md:justify-start' : 'md:justify-center lg:justify-start'}`}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={isTabletSidebarExpanded ? 'md:inline' : 'md:hidden lg:inline'}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 min-w-0 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Toggle navigation sidebar"
              aria-expanded={isMobileMenuOpen || isTabletSidebarExpanded}
              onClick={toggleNavigation}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              type="button"
              aria-label={isTabletSidebarExpanded ? 'Collapse navigation sidebar' : 'Expand navigation sidebar'}
              aria-expanded={isTabletSidebarExpanded}
              onClick={toggleNavigation}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 md:flex lg:hidden"
            >
              {isTabletSidebarExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <HeartPulse className="h-5 w-5 shrink-0 text-blue-700 md:hidden" aria-hidden="true" />
            <div className="min-w-0">
              <p className="hidden truncate text-xs font-medium capitalize text-gray-500 sm:block">{user.role} portal</p>
              <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700" aria-hidden="true">
              {user.fullName.charAt(0)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs capitalize text-gray-500">{user.role}</p>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};