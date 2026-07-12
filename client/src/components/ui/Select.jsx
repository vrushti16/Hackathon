// Select.jsx - Reusable dropdown selector component with forwardRef
import React from 'react';

const Select = React.forwardRef(({
  label,
  options = [],
  placeholder = 'Select option...',
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400 flex items-center"
        >
          {label}
          {required && <span className="text-brand-red ml-1 font-bold">*</span>}
        </label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        ref={ref}
        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
          error 
            ? 'border-brand-red focus:ring-brand-red/40' 
            : 'border-brand-slate-200 dark:border-brand-slate-800'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="" className="text-brand-slate-800 dark:bg-brand-slate-900">{placeholder}</option>}
        {options.map((opt, index) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={index} value={val} className="text-brand-slate-800 dark:bg-brand-slate-950">
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="text-[10px] text-brand-red font-semibold animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
