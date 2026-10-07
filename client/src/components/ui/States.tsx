import React from 'react';
import { AlertCircle, FileSearch, Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading...' }: any) => (
  <div className="flex flex-col items-center justify-center p-12 text-gray-400">
    <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
    <p>{message}</p>
  </div>
);

export const EmptyState = ({ title, message, action }: any) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 text-gray-400">
      <FileSearch className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-sm">{message}</p>
    {action}
  </div>
);

export const ErrorState = ({ message, onRetry }: any) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100">
    <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
    <p className="text-red-700 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors">
        Try Again
      </button>
    )}
  </div>
);