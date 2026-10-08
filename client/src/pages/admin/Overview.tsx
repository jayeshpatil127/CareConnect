import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { getAdminOverview } from '../../services/adminService';
import { Users, Stethoscope, Calendar, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOverview() {
  const [stats, setStats] = useState<{
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminOverview();
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clinic statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <LoadingState message="Loading clinic overview..." />
      </Card>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-600" />
          Clinic Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          High-level key performance metrics for clinic administration.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Doctors */}
        <Link to="/admin/doctors" className="block group">
          <Card className="p-6 transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalDoctors ?? 0}
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium group-hover:underline">
                  Manage doctors &rarr;
                </p>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Patients */}
        <Link to="/admin/patients" className="block group">
          <Card className="p-6 transition-all hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalPatients ?? 0}
                </p>
                <p className="text-xs text-emerald-600 mt-1 font-medium group-hover:underline">
                  Manage patients &rarr;
                </p>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Appointments */}
        <Link to="/admin/appointments" className="block group">
          <Card className="p-6 transition-all hover:border-purple-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalAppointments ?? 0}
                </p>
                <p className="text-xs text-purple-600 mt-1 font-medium group-hover:underline">
                  View appointments &rarr;
                </p>
              </div>
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}