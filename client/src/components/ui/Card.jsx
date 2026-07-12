// Card.jsx - Reusable glassmorphic panel container card
import React from 'react';
import Loader from '../common/Loader';

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon = null,
  action = null,
  loading = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`glass-panel p-6 rounded-xl hover:-translate-y-0.5 transition-all duration-200 group ${className}`} {...props}>
      {(title || subtitle || Icon || action) && (
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              {Icon && (
                <Icon className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform duration-200" />
              )}
              {title && (
                <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">
                  {title}
                </h4>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {loading ? (
        <div className="py-8 flex items-center justify-center">
          <Loader size="md" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Card;
