// StatusBadge.jsx - Uniform color status indicator badges
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Active':
      case 'Available':
      case 'Closed':
        return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'In Shop':
      case 'Open':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/20';
      case 'Out of Service':
      default:
        return 'bg-brand-red/10 text-brand-red border-brand-red/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
};

export default StatusBadge;
