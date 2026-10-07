import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

export default function PatientProfile() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      <Card>
        <CardHeader title="Personal Information" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
              <p className="text-gray-900 font-medium">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader title="Medical Details" />
        <CardContent>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-700">
            Note: Patient profile editing APIs are not fully implemented in the current backend commit. This section will connect to backend medical records when available.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}