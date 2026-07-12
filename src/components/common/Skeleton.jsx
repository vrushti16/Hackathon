// Skeleton.jsx - Layout loading state placeholders
import React from 'react';

// Generic box/rectangle skeleton
export const SkeletonRect = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <div className={`shimmer-bg rounded-lg ${width} ${height} ${className}`} />
  );
};

// Generic circle skeleton
export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => {
  return (
    <div className={`shimmer-bg rounded-full ${size} ${className}`} />
  );
};

// KPI Card Skeleton
export const KpiCardSkeleton = () => {
  return (
    <div className="glass-panel p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonRect width="w-24" height="h-4" />
        <SkeletonCircle size="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <SkeletonRect width="w-20" height="h-8" />
        <SkeletonRect width="w-32" height="h-3.5" />
      </div>
    </div>
  );
};

// Chart Loading Skeleton
export const ChartSkeleton = ({ height = 'h-72' }) => {
  return (
    <div className="glass-panel p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <SkeletonRect width="w-40" height="h-5" />
          <SkeletonRect width="w-24" height="h-3" />
        </div>
        <div className="flex space-x-2">
          <SkeletonRect width="w-12" height="h-6" />
          <SkeletonRect width="w-12" height="h-6" />
        </div>
      </div>
      {/* Bars/Grid Simulation */}
      <div className={`flex items-end justify-between ${height} pt-4 pb-2 px-2 border-b border-l border-brand-slate-200 dark:border-brand-slate-800`}>
        <SkeletonRect width="w-[10%]" height="h-[40%]" className="rounded-t-md" />
        <SkeletonRect width="w-[10%]" height="h-[65%]" className="rounded-t-md" />
        <SkeletonRect width="w-[10%]" height="h-[80%]" className="rounded-t-md" />
        <SkeletonRect width="w-[10%]" height="h-[50%]" className="rounded-t-md" />
        <SkeletonRect width="w-[10%]" height="h-[95%]" className="rounded-t-md" />
        <SkeletonRect width="w-[10%]" height="h-[30%]" className="rounded-t-md" />
        <SkeletonRect width="w-[10%]" height="h-[60%]" className="rounded-t-md" />
      </div>
    </div>
  );
};

// Data Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header filter bar */}
      <div className="p-4 border-b border-brand-slate-100 dark:border-brand-slate-900 flex justify-between items-center">
        <SkeletonRect width="w-64" height="h-10" className="rounded-xl" />
        <div className="flex space-x-2">
          <SkeletonRect width="w-24" height="h-10" className="rounded-xl" />
          <SkeletonRect width="w-24" height="h-10" className="rounded-xl" />
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-brand-slate-100 dark:divide-brand-slate-900">
        {/* Table Head Mock */}
        <div className="flex p-4 bg-brand-slate-50/50 dark:bg-brand-slate-950/20">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`th-${i}`} className="flex-1 px-2">
              <SkeletonRect width="w-2/3" height="h-4" />
            </div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`tr-${r}`} className="flex p-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={`td-${r}-${c}`} className="flex-1 px-2">
                {c === 0 ? (
                  <div className="flex items-center space-x-3">
                    <SkeletonCircle size="w-8 h-8" />
                    <SkeletonRect width="w-24" height="h-4" />
                  </div>
                ) : (
                  <SkeletonRect width="w-16" height="h-4" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Footer bar */}
      <div className="p-4 border-t border-brand-slate-100 dark:border-brand-slate-900 flex justify-between items-center">
        <SkeletonRect width="w-32" height="h-4" />
        <SkeletonRect width="w-48" height="h-8" className="rounded-xl" />
      </div>
    </div>
  );
};
export default SkeletonRect;
