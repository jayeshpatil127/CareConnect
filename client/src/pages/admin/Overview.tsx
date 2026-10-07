import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <Card>
        <CardContent className="text-center p-12 text-gray-500">
           Welcome Admin! APIs for admin dashboard are pending backend implementation.
        </CardContent>
      </Card>
    </div>
  );
}