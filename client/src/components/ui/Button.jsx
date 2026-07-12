// Button.jsx - Reusable customizable button component
import React from 'react';
import Loader from '../common/Loader';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, success, danger, outline, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left', // left, right
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-btn focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer';

  const variants = {
    primary: 'text-white bg-brand-blue shadow-sm shadow-brand-blue/20',
    secondary: 'text-brand-slate-700 dark:text-brand-slate-200 bg-brand-slate-100 dark:bg-brand-slate-900 border border-brand-slate-200/50 dark:border-brand-slate-800/50',
    success: 'text-white bg-brand-green shadow-sm shadow-brand-green/20',
    danger: 'text-white bg-brand-red shadow-sm shadow-brand-red/20',
    outline: 'text-brand-slate-700 dark:text-brand-slate-200 bg-transparent border border-brand-slate-200 dark:border-brand-slate-800',
    ghost: 'text-brand-slate-700 dark:text-brand-slate-200 bg-transparent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader size="sm" className="text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
