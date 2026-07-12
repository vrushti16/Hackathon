// KpiCard.jsx - Summary metrics display component
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KpiCardSkeleton } from './Skeleton';

const KpiCard = ({
  title,
  value,
  icon: Icon,
  trend, // number (e.g. +12 or -5)
  trendLabel = 'vs last month',
  isCost = false,
  isLoading = false
}) => {
  if (isLoading) {
    return <KpiCardSkeleton />;
  }

  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0 || trend === undefined;

  const getTrendColor = () => {
    if (isNeutral) return 'text-brand-slate-400 dark:text-brand-slate-500';
    // If it's cost: lower is better (green), higher is worse (red).
    // Otherwise: higher is better (green), lower is worse (red).
    if (isCost) {
      return isNegative ? 'text-brand-green bg-brand-green/10' : 'text-brand-red bg-brand-red/10';
    }
    return isPositive ? 'text-brand-green bg-brand-green/10' : 'text-brand-red bg-brand-red/10';
  };

  const formattedValue = typeof value === 'number' && !String(value).includes('%')
    ? isCost
      ? `$${value.toLocaleString()}`
      : value.toLocaleString()
    : value;

  return (
    <div className="glass-panel p-6 rounded-xl hover:translate-y-[-2px] transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-slate-500 dark:text-brand-slate-400 group-hover:text-brand-slate-700 dark:group-hover:text-brand-slate-200 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-brand-slate-100 dark:bg-brand-slate-900 text-brand-slate-600 dark:text-brand-slate-300 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
          {formattedValue}
        </h3>
        
        {trend !== undefined && (
          <div className="flex items-center space-x-1.5 text-xs">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-lg font-semibold ${getTrendColor()}`}>
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {isNeutral && <Minus className="w-3.5 h-3.5 mr-0.5" />}
              {trend !== 0 ? `${Math.abs(trend)}%` : '0%'}
            </span>
            <span className="text-brand-slate-400 dark:text-brand-slate-500 font-medium">
              {trendLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
