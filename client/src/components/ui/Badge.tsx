import React from 'react';

export const Badge = ({ children, variant = 'neutral' }: any) => {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant as keyof typeof variants]}`}>
      {children}
    </span>
  );
};