// Table.jsx - Reusable enterprise data table with sticky header support
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableSkeleton } from '../common/Skeleton';

const Table = ({
  columns = [],
  data = [],
  sortKey,
  sortOrder,
  onSort,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  isLoading = false,
  emptyState,
  stickyHeader = true,
  className = ''
}) => {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length + (onSelectRow ? 1 : 0)} />;
  }

  if (data.length === 0 && emptyState) {
    return emptyState;
  }

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleHeaderSort = (key, sortable) => {
    if (!sortable || !onSort) return;
    const nextOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, nextOrder);
  };

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/50 dark:bg-brand-slate-900/50 backdrop-blur-md shadow-sm relative max-h-[600px] scrollbar ${className}`}>
      <table className="w-full border-collapse text-left text-xs">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr className="border-b border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-100/90 dark:bg-brand-slate-950/90 backdrop-blur-md">
            {onSelectAll && (
              <th className="p-3.5 w-12 text-center select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-brand-slate-300 dark:border-brand-slate-700 text-brand-blue focus:ring-brand-blue/30 w-4 h-4 cursor-pointer"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleHeaderSort(col.key, col.sortable)}
                className={`p-3.5 font-bold text-brand-slate-500 dark:text-brand-slate-400 select-none ${
                  col.sortable ? 'cursor-pointer hover:text-brand-slate-800 dark:hover:text-brand-slate-200' : ''
                } ${col.className || ''}`}
              >
                <div className="flex items-center space-x-1.5">
                  <span>{col.header}</span>
                  {col.sortable && sortKey === col.key && (
                    <span>
                      {sortOrder === 'asc' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-slate-100 dark:divide-brand-slate-900">
          {data.map((row, index) => {
            const isSelected = selectedIds.includes(row.id);
            return (
              <tr
                key={row.id || index}
                className={`hover:bg-brand-slate-50/40 dark:hover:bg-brand-slate-900/30 transition-colors duration-150 ${
                  isSelected ? 'bg-brand-blue/5 dark:bg-brand-blue/5' : ''
                }`}
              >
                {onSelectRow && (
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(row.id)}
                      className="rounded border-brand-slate-300 dark:border-brand-slate-700 text-brand-blue focus:ring-brand-blue/30 w-4 h-4 cursor-pointer"
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`p-3.5 text-brand-slate-700 dark:text-brand-slate-300 font-medium ${col.className || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
