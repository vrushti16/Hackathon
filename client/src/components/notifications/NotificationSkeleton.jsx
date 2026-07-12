import React from 'react';

const NotificationSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl border border-brand-slate-100 dark:border-brand-slate-800 bg-brand-slate-50/50 dark:bg-brand-slate-900/50">
          <div className="h-10 w-10 rounded-full shimmer-bg flex-shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 shimmer-bg rounded"></div>
            <div className="h-3 w-full shimmer-bg rounded"></div>
            <div className="h-3 w-1/4 shimmer-bg rounded mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
