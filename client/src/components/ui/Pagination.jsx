// Pagination.jsx - Reusable paging control component for lists and tables
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-transparent border-t border-brand-slate-200/40 dark:border-brand-slate-800/40 sm:px-6 ${className}`}>
      {/* Mobile view buttons */}
      <div className="flex justify-between flex-1 sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3"
        >
          Next
        </Button>
      </div>

      {/* Desktop view controls */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
            Showing Page <span className="font-semibold text-brand-slate-800 dark:text-white">{currentPage}</span> of{' '}
            <span className="font-semibold text-brand-slate-800 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-xs -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 text-xs font-semibold text-brand-slate-500 dark:text-brand-slate-400 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                className={`relative inline-flex items-center px-3.5 py-1.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  currentPage === pageNum
                    ? 'z-10 bg-brand-blue border-brand-blue text-white'
                    : 'bg-white dark:bg-brand-slate-950 border-brand-slate-200 dark:border-brand-slate-800 text-brand-slate-500 dark:text-brand-slate-400 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 text-xs font-semibold text-brand-slate-500 dark:text-brand-slate-400 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
