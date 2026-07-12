// Input.jsx - Reusable form input component with React.forwardRef
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  helperText,
  icon: Icon = null,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400 flex items-center"
        >
          {label}
          {required && <span className="text-brand-red ml-1 font-bold">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
        )}
        <input
          id={inputId}
          type={resolvedType}
          placeholder={placeholder}
          disabled={disabled}
          ref={ref}
          className={`w-full py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white placeholder-brand-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
            Icon ? 'pl-10 pr-4' : 'px-3.5'
          } ${
            isPassword ? 'pr-10' : ''
          } ${
            error 
              ? 'border-brand-red focus:ring-brand-red/40' 
              : 'border-brand-slate-200 dark:border-brand-slate-800'
          } ${className}`}
          {...props}
        />
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-2.5 text-brand-slate-400 hover:text-brand-slate-600 dark:hover:text-brand-slate-200 focus:outline-none cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-brand-red font-semibold animate-fade-in">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
