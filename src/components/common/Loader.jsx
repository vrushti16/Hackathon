// Loader.jsx - Visual loading spinner component
import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-brand-slate-200 dark:border-brand-slate-800 border-t-brand-blue rounded-full animate-spin`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
