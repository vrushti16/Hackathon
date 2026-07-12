// Toast.jsx - Reusable toast alert notifications component
import React from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export const ToastItem = ({ id, message, type, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white dark:bg-brand-slate-900 border-brand-green/20 dark:border-brand-green/10',
          icon: <CheckCircle2 className="w-5 h-5 text-brand-green" />,
          progress: 'bg-brand-green'
        };
      case 'danger':
      case 'error':
        return {
          bg: 'bg-white dark:bg-brand-slate-900 border-brand-red/20 dark:border-brand-red/10',
          icon: <AlertCircle className="w-5 h-5 text-brand-red" />,
          progress: 'bg-brand-red'
        };
      case 'warning':
        return {
          bg: 'bg-white dark:bg-brand-slate-900 border-brand-orange/20 dark:border-brand-orange/10',
          icon: <AlertTriangle className="w-5 h-5 text-brand-orange" />,
          progress: 'bg-brand-orange'
        };
      case 'info':
      default:
        return {
          bg: 'bg-white dark:bg-brand-slate-900 border-brand-blue/20 dark:border-brand-blue/10',
          icon: <Info className="w-5 h-5 text-brand-blue" />,
          progress: 'bg-brand-blue'
        };
    }
  };

  const styles = getStyles();
  const title = type === 'danger' ? 'Error' : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div 
      className={`flex items-start p-4 rounded-xl border shadow-lg ${styles.bg} max-w-sm w-full pointer-events-auto overflow-hidden animate-fade-in relative transition-all duration-300 hover:scale-[1.02]`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {styles.icon}
      </div>
      <div className="flex-1 pt-0.5 pr-2">
        <p className="text-xs font-bold text-brand-slate-900 dark:text-white font-display">
          {title}
        </p>
        <p className="mt-1 text-[10px] text-brand-slate-500 dark:text-brand-slate-400 leading-normal font-medium">
          {message}
        </p>
      </div>
      <div className="flex-shrink-0 flex">
        <button
          onClick={() => onClose(id)}
          type="button"
          className="inline-flex rounded-md text-brand-slate-400 dark:text-brand-slate-500 hover:text-brand-slate-600 dark:hover:text-brand-slate-350 focus:outline-none cursor-pointer"
        >
          <span className="sr-only">Close</span>
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Animated progress bar indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-slate-100 dark:bg-brand-slate-800">
        <div 
          className={`h-full ${styles.progress} transition-all duration-4000 ease-linear`}
          style={{ width: '0%', animation: 'shrinkWidth 4s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, dismissToast } = useFleet();

  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="assertive" 
      className="fixed bottom-5 right-5 z-[60] flex flex-col space-y-3 w-full max-w-sm pointer-events-none"
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={dismissToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
