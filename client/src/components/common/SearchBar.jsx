// SearchBar.jsx - Reusable styled text search input
import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear
}) => {
  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/50 dark:bg-brand-slate-900/50 text-sm placeholder-brand-slate-400 dark:placeholder-brand-slate-500 text-brand-slate-800 dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all duration-200"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          type="button"
          className="absolute right-3 p-0.5 rounded-lg text-brand-slate-400 dark:text-brand-slate-500 hover:text-brand-slate-600 dark:hover:text-brand-slate-300 hover:bg-brand-slate-100 dark:hover:bg-brand-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
