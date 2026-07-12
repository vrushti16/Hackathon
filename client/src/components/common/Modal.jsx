// Modal.jsx - Reusable modal overlay component
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* Modal Wrapper Card */}
      <div 
        className={`w-[95%] md:w-[80%] lg:w-full ${sizeClasses[size]} glass-modal rounded-2xl relative z-10 flex flex-col max-h-[90vh] shadow-2xl animate-scale-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-slate-100 dark:border-brand-slate-900">
          <h3 id="modal-title" className="text-lg font-bold text-brand-slate-900 dark:text-white font-display">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-xl text-brand-slate-400 dark:text-brand-slate-500 hover:text-brand-slate-600 dark:hover:text-brand-slate-300 hover:bg-brand-slate-100 dark:hover:bg-brand-slate-900 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-brand-slate-600 dark:text-brand-slate-350">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
