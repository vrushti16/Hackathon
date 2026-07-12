// Loader.jsx - Reusable loaders, spinners, and skeleton loading state components
import React from 'react';
import { SkeletonRect, SkeletonCircle, KpiCardSkeleton, TableSkeleton } from '../common/Skeleton';

// Base Spinner Loader Component
const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
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

// Fullscreen Page Loader Component
export const PageLoader = ({ message = 'Loading system views...' }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-slate-50/80 dark:bg-brand-slate-950/80 backdrop-blur-md space-y-4">
      <Loader size="lg" />
      <p className="text-xs font-semibold text-brand-slate-600 dark:text-brand-slate-400 font-display animate-pulse">
        {message}
      </p>
    </div>
  );
};

// Custom Table Loader Component (Wraps a Spinner inside container)
export const TableLoader = ({ rows = 5, cols = 5 }) => {
  return <TableSkeleton rows={rows} cols={cols} />;
};

// Button Loader (Uses the base spinner with size small)
export const ButtonLoader = () => {
  return <Loader size="sm" className="text-current" />;
};

// Skeleton Card Placeholder Component (KPI / Stats card skeleton)
export const SkeletonCard = () => {
  return <KpiCardSkeleton />;
};

// Skeleton Table Placeholder Component
export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return <TableSkeleton rows={rows} cols={cols} />;
};

export default Loader;
