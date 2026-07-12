import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-brand-slate-900/40 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close drawer" />
      <div className="relative h-full w-full max-w-xl overflow-y-auto border-l border-brand-slate-200 bg-white p-6 shadow-2xl dark:border-brand-slate-800 dark:bg-brand-slate-950">
        <div className="flex items-center justify-between border-b border-brand-slate-200 pb-4 dark:border-brand-slate-800">
          <h3 className="text-lg font-bold text-brand-slate-900 dark:text-white">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-brand-slate-500 hover:bg-brand-slate-100 dark:hover:bg-brand-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
