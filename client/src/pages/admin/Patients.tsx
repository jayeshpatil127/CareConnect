import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import {
  getAdminPatients,
  addPatient,
} from '../../services/adminService';
import {
  Users,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
} from 'lucide-react';

export default function AdminPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Action messages
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Add Patient Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    bloodGroup: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    setActionError('');
    try {
      const filters: any = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const res = await getAdminPatients(filters);
      setPatients(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    setFormLoading(true);
    try {
      const res = await addPatient({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        bloodGroup: formData.bloodGroup || null,
        allergies: formData.allergies.trim() || null,
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || null,
      });

      if (res.success) {
        setActionSuccess(`Patient account for ${formData.fullName} created successfully.`);
        setShowAddModal(false);
        setFormData({
          fullName: '',
          email: '',
          password: '',
          bloodGroup: '',
          allergies: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
        fetchPatients();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create patient account');
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
            <Users className="w-7 h-7 text-blue-600" />
            Patients Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Register and manage clinic patient profiles and contact records.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Patient
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

      {/* Search Bar */}
      <div className="w-full sm:w-72">
        <Input
          placeholder="Search patient name or email..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patients Table */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching patient directory..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPatients} />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          message={
            searchTerm
              ? `No patient records match "${searchTerm}".`
              : 'No patient accounts exist in the clinic.'
          }
          action={
            searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Clear search
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
                  <th scope="col" className="px-6 py-3.5">Blood Group</th>
                  <th scope="col" className="px-6 py-3.5">Emergency Contact</th>
                  <th scope="col" className="px-6 py-3.5">Allergies</th>
                  <th scope="col" className="px-6 py-3.5">Total Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {pat.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{pat.fullName}</p>
                          <p className="text-xs text-gray-400">{pat.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pat.bloodGroup ? (
                        <Badge variant="info">{pat.bloodGroup}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700">
                      {pat.emergencyContactName ? (
                        <div>
                          <p className="font-medium text-gray-900">{pat.emergencyContactName}</p>
                          <p className="text-gray-500">{pat.emergencyContactPhone || 'No phone'}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                      {pat.allergies || <span className="text-gray-400">None</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-800">
                      {pat.appointmentCount} consultations
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Register New Patient
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="max-h-[calc(100dvh-8rem)] space-y-4 overflow-y-auto p-5">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                label="Full Name *"
                required
                placeholder="Patient Full Name"
                value={formData.fullName}
                onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Email Address *"
                type="email"
                required
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Password * (min 8 chars)"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
              />

              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e: any) => setFormData({ ...formData, bloodGroup: e.target.value })}
                options={[
                  { value: '', label: 'Select blood group' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
              />

              <Input
                label="Known Allergies"
                placeholder="e.g. Penicillin, Peanuts (or leave blank)"
                value={formData.allergies}
                onChange={(e: any) => setFormData({ ...formData, allergies: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Emergency Contact Name"
                  placeholder="Contact person"
                  value={formData.emergencyContactName}
                  onChange={(e: any) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                />
                <Input
                  label="Emergency Phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyContactPhone}
                  onChange={(e: any) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Registering...' : 'Register Patient'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
