import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { getAdminAppointments } from '../../services/adminService';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  MapPin,
  Video,
  User,
  Stethoscope,
} from 'lucide-react';

const STATUS_BADGE_VARIANTS: Record<string, 'success' | 'warning' | 'neutral' | 'info' | 'danger'> = {
  upcoming: 'info',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      if (statusFilter) filters.status = statusFilter;

      const res = await getAdminAppointments(filters);
      setAppointments(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clinic appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAppointments();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Clinic Appointments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete schedule of all consultations across all doctors and patients.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search patient or doctor..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm self-stretch sm:self-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <label htmlFor="status-filter" className="text-xs font-medium text-gray-600">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching clinic appointments..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAppointments} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          message={
            searchTerm || statusFilter
              ? 'No appointments match the search term or status filter.'
              : 'No appointments have been booked in the clinic.'
          }
          action={
            searchTerm || statusFilter ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Clear filters
              </button>
            ) : null
          }
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Patient</th>
                  <th scope="col" className="px-6 py-3.5">Doctor</th>
                  <th scope="col" className="px-6 py-3.5">Date & Time</th>
                  <th scope="col" className="px-6 py-3.5">Room</th>
                  <th scope="col" className="px-6 py-3.5">Mode</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                          {appt.patientName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{appt.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{appt.doctorName}</p>
                          <p className="text-xs text-gray-400">{appt.doctorSpecialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">{formatDate(appt.appointmentDate)}</span>
                        <span className="text-gray-500">{appt.appointmentTime?.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {appt.room ? (
                        <span className="inline-flex items-center gap-1 font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {appt.room}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appt.mode === 'video' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          <Video className="w-3 h-3" />
                          Video
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                          <User className="w-3 h-3 text-gray-500" />
                          In-Person
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Badge variant={STATUS_BADGE_VARIANTS[appt.status.toLowerCase()] || 'neutral'}>
                        {appt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Total <span className="font-semibold text-gray-700">{appointments.length}</span> appointment{appointments.length === 1 ? '' : 's'}
            </span>
            <span className="text-gray-400">Clinic Management System</span>
          </div>
        </div>
      )}
    </div>
  );
}
