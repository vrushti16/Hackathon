import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KpiCardSkeleton } from '../common/Skeleton';

const AnalyticsCards = ({ title, value, icon: Icon, trend, trendLabel, isCost = false, isLoading = false, error = null }) => {
  if (isLoading) {
    return <KpiCardSkeleton />;
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-brand-red/20 bg-brand-red/5 flex items-center justify-center">
        <p className="text-xs text-brand-red font-medium">Failed to load {title}</p>
      </div>
    );
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  
  // Logic for good/bad trend colors based on cost vs non-cost
  let trendColor = 'text-brand-slate-500';
  let trendBg = 'bg-brand-slate-100 dark:bg-brand-slate-800';
  
  if (trend > 0) {
    trendColor = isCost ? 'text-brand-red' : 'text-brand-green';
    trendBg = isCost ? 'bg-brand-red/10' : 'bg-brand-green/10';
  } else if (trend < 0) {
    trendColor = isCost ? 'text-brand-green' : 'text-brand-red';
    trendBg = isCost ? 'bg-brand-green/10' : 'bg-brand-red/10';
  }

  return (
    <div className="glass-panel p-5 rounded-xl space-y-3 transition-card group relative">
      {/* Tooltip trigger wrapper */}
      <div className="absolute inset-0 z-10 group-hover:block hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-brand-slate-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Historical data for {title}
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[11px] font-bold text-brand-slate-500 dark:text-brand-slate-400 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-2xl font-bold font-display text-brand-slate-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded flex-shrink-0 ${trendBg} ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span className="text-[10px] font-bold">
            {Math.abs(trend)}%
          </span>
        </div>
        <span className="text-[10px] font-semibold text-brand-slate-450 dark:text-brand-slate-500 truncate">
          {trendLabel}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsCards;
