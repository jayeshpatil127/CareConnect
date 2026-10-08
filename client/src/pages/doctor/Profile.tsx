import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import {
  getDoctorProfile,
  updateDoctorProfile,
} from '../../services/doctorService';
import {
  User,
  Mail,
  Stethoscope,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [status, setStatus] = useState('active');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDoctorProfile();
      const p = res.data;
      setProfile(p);
      setFullName(p.fullName || '');
      setSpecialization(p.specialization || '');
      setStatus(p.status || 'active');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!fullName.trim()) {
      setSaveError('Full Name cannot be empty');
      return;
    }
    if (!specialization.trim()) {
      setSaveError('Specialization cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await updateDoctorProfile({
        fullName: fullName.trim(),
        specialization: specialization.trim(),
        status,
      });

      if (res.success) {
        setProfile(res.data);
        setSaveSuccess('Doctor profile updated successfully.');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <LoadingState message="Loading doctor profile..." />
      </Card>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProfile} />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          Doctor Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your professional practice details and availability status.
        </p>
      </div>

      {/* Feedback Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center">
            {profile?.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.fullName}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="info">{profile?.specialization}</Badge>
              <Badge
                variant={
                  profile?.status === 'active'
                    ? 'success'
                    : profile?.status === 'on-leave'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {profile?.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-5 pt-6">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e: any) => setFullName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-2 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email is your login identifier and cannot be changed here.
            </p>
          </div>

          <Input
            label="Specialization"
            required
            placeholder="e.g. Cardiology, General Practitioner, Pediatrics"
            value={specialization}
            onChange={(e: any) => setSpecialization(e.target.value)}
          />

          <Select
            label="Practice Availability Status"
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            options={[
              { value: 'active', label: 'Active (Accepting Appointments)' },
              { value: 'on-leave', label: 'On Leave' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
