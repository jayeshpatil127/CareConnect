import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import {
  getAdminDoctors,
  addDoctor,
  updateDoctorStatus,
} from '../../services/adminService';
import {
  Stethoscope,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';

const STATUS_BADGE_VARIANTS: Record<string, 'success' | 'warning' | 'neutral' | 'info' | 'danger'> = {
  active: 'success',
  'on-leave': 'warning',
  inactive: 'neutral',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status updating tracking
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Add Doctor Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    status: 'active',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    setActionError('');
    try {
      const filters: any = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      if (statusFilter) filters.status = statusFilter;

      const res = await getAdminDoctors(filters);
      setDoctors(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (doctorId: number, newStatus: string) => {
    setUpdatingId(doctorId);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await updateDoctorStatus(doctorId, newStatus);
      if (res.success) {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === doctorId ? { ...doc, status: newStatus } : doc
          )
        );
        setActionSuccess(`Doctor status updated to "${newStatus}".`);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update doctor status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    setFormLoading(true);
    try {
      const res = await addDoctor(formData);
      if (res.success) {
        setActionSuccess(`Doctor account for ${formData.fullName} created successfully.`);
        setShowAddModal(false);
        setFormData({
          fullName: '',
          email: '',
          password: '',
          specialization: '',
          status: 'active',
        });
        fetchDoctors();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create doctor account');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            Doctors Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage medical staff accounts, specializations, and availability status.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search doctor or specialty..."
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
            <option value="active">Active</option>
            <option value="on-leave">On-Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching doctors..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          message={
            searchTerm || statusFilter
              ? 'No doctor records match the specified search or filter.'
              : 'No doctor accounts exist in the system.'
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
                  <th scope="col" className="px-6 py-3.5">Doctor</th>
                  <th scope="col" className="px-6 py-3.5">Specialization</th>
                  <th scope="col" className="px-6 py-3.5">Consultations</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {doc.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.fullName}</p>
                          <p className="text-xs text-gray-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {doc.specialization}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      {doc.appointmentCount} visits
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_BADGE_VARIANTS[doc.status] || 'neutral'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {updatingId === doc.id ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                          className="text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md px-2.5 py-1.5 outline-none hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="active">Active</option>
                          <option value="on-leave">On-Leave</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Add New Doctor
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                label="Full Name *"
                required
                placeholder="Dr. Jane Doe"
                value={formData.fullName}
                onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Email Address *"
                type="email"
                required
                placeholder="doctor@clinic.com"
                value={formData.email}
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Temporary Password * (min 8 chars)"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
              />

              <Input
                label="Specialization *"
                required
                placeholder="e.g. Cardiology, Pediatrics, Dermatology"
                value={formData.specialization}
                onChange={(e: any) => setFormData({ ...formData, specialization: e.target.value })}
              />

              <Select
                label="Initial Availability Status"
                value={formData.status}
                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'on-leave', label: 'On-Leave' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Doctor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
