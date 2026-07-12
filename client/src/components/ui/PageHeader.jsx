// PageHeader.jsx - Reusable title and header action layout component
import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  children = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-slate-200/50 dark:border-brand-slate-800/50 pb-5 ${className}`}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-brand-slate-500 dark:text-brand-slate-450 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
