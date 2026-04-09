import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { Icons } from '../constants';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bg =
    toast.type === 'success'
      ? 'bg-green-600'
      : toast.type === 'warning'
        ? 'bg-yellow-500'
        : 'bg-red-600';

  return (
    <div
      className={`${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] view-transition`}
    >
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <Icons.X className="w-4 h-4" />
      </button>
    </div>
  );
};
