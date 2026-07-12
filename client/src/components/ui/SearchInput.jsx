// SearchInput.jsx - Reusable search field with search icon
import React from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = React.forwardRef(({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className={`relative w-full sm:max-w-xs ${className}`}>
      <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
      <input
        type="text"
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-800 dark:text-white placeholder-brand-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        {...props}
      />
      {value && onClear && !disabled && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-2 text-brand-slate-400 hover:text-brand-slate-600 dark:hover:text-brand-slate-200 focus:outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
