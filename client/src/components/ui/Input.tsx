import React from 'react';

export const Input = ({ label, error, ...props }: any) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input 
        className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...props} 
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};