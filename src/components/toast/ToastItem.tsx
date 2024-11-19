"use client"
import React from 'react';
import { useToast } from './ToastContext';


const ToastList: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 space-y-3 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-md text-white ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : toast.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
        >
          <span>{toast.message}</span>
          <button
            className="ml-3 text-sm underline"
            onClick={() => removeToast(toast.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastList;
