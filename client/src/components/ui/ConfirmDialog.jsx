// ConfirmDialog.jsx - Reusable prompt action verification dialog
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-3 rounded-full ${isDanger ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'}`}>
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400 leading-relaxed">
          {message}
        </p>
        
        <div className="flex items-center justify-end gap-3 w-full pt-4">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
