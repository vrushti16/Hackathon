// FilterBar.jsx - Reusable searching and filtering parameters container bar
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import SearchInput from './SearchInput';
import Button from './Button';

const FilterBar = ({
  searchVal = '',
  onSearchChange = null,
  searchPlaceholder = 'Search...',
  onReset = null,
  children = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/30 dark:bg-brand-slate-900/10 p-4 rounded-xl border border-brand-slate-200/50 dark:border-brand-slate-800/50 backdrop-blur-md shadow-xs ${className}`}>
      {/* Search side */}
      {onSearchChange ? (
        <SearchInput
          value={searchVal}
          onChange={onSearchChange}
          onClear={onReset ? () => onSearchChange({ target: { value: '' } }) : null}
          placeholder={searchPlaceholder}
          className="w-full md:max-w-xs"
        />
      ) : (
        <div className="hidden md:block w-[1px]" />
      )}

      {/* Filters & Actions side */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
        {children}
        
        {onReset && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            icon={RefreshCcw}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
