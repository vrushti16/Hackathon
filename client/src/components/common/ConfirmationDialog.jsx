// ConfirmationDialog.jsx - Reusable prompt for critical actions
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm Delete',
  cancelText = 'Cancel',
  isDanger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-3 rounded-full ${isDanger ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'}`}>
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-sm text-brand-slate-500 dark:text-brand-slate-400">
          {message}
        </p>
        
        <div className="flex items-center justify-end space-x-3 w-full pt-4">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-2 px-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
              isDanger 
                ? 'bg-brand-red hover:bg-brand-red/90 hover:shadow-md' 
                : 'bg-brand-blue hover:bg-brand-blue-hover hover:shadow-md'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
