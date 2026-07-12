// StatusBadge.jsx - Reusable status indicator badges
import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStyles = () => {
    const s = String(status || '').trim().toLowerCase();
    switch (s) {
      case 'active':
      case 'available':
      case 'completed':
      case 'closed':
      case 'success':
        return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'pending':
      case 'in progress':
      case 'in shop':
      case 'open':
      case 'draft':
      case 'warning':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/20';
      case 'cancelled':
      case 'inactive':
      case 'maintenance':
      case 'out of service':
      case 'retired':
      case 'danger':
      case 'failed':
        return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      default:
        return 'bg-brand-slate-100 dark:bg-brand-slate-900 text-brand-slate-500 dark:text-brand-slate-400 border-brand-slate-200 dark:border-brand-slate-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase ${getStyles()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
};

export default StatusBadge;
