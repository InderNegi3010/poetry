import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md flex items-center space-x-3 my-4">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}