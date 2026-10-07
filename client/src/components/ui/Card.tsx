import React from 'react';

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, action }: any) => (
  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
    <h3 className="font-semibold text-gray-900">{title}</h3>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);