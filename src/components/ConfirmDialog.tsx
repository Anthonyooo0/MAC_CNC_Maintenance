import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-mac-navy hover:bg-mac-blue'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
