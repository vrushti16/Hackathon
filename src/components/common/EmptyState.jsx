// EmptyState.jsx - Informative placeholder for empty collections
import React from 'react';
import { ArchiveRestore } from 'lucide-react';

const EmptyState = ({
  icon: Icon = ArchiveRestore,
  title = 'No results found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  actionText,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel max-w-lg mx-auto my-8 animate-fade-in">
      <div className="p-4 bg-brand-slate-100 dark:bg-brand-slate-900 rounded-2xl text-brand-slate-400 dark:text-brand-slate-500 mb-5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-brand-slate-800 dark:text-white font-display mb-2">
        {title}
      </h3>
      <p className="text-sm text-brand-slate-500 dark:text-brand-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
