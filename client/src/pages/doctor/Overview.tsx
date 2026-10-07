import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

export default function DoctorOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
      <Card>
        <CardContent className="text-center p-12 text-gray-500">
           Welcome Doctor! APIs for doctor dashboard are pending backend implementation.
        </CardContent>
      </Card>
    </div>
  );
}