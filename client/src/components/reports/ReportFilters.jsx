import React, { memo } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import Button from '../ui/Button';

const ReportFilters = memo(({ filters, setFilters, onApply, onReset, vehicles, drivers }) => {
  const quickFilters = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Month', value: 'this_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-brand-slate-100 dark:border-brand-slate-900 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {quickFilters.map(qf => (
            <button
              key={qf.value}
              onClick={() => handleChange('quickRange', qf.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filters.quickRange === qf.value 
                  ? 'bg-brand-blue text-white' 
                  : 'bg-brand-slate-50 dark:bg-brand-slate-900 text-brand-slate-600 dark:text-brand-slate-400 hover:bg-brand-slate-100 dark:hover:bg-brand-slate-800'
              }`}
            >
              {qf.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={onReset} icon={X} className="flex-1 md:flex-none">
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={onApply} icon={Filter} className="flex-1 md:flex-none">
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Date Range Custom (Only show if Custom is selected) */}
        {filters.quickRange === 'custom' && (
          <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
            <input 
              type="date" 
              value={filters.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 focus:border-brand-blue outline-none"
            />
            <span className="text-brand-slate-400">to</span>
            <input 
              type="date" 
              value={filters.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 focus:border-brand-blue outline-none"
            />
          </div>
        )}

        <select 
          value={filters.vehicleId || ''} 
          onChange={(e) => handleChange('vehicleId', e.target.value)}
          className="text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 outline-none"
        >
          <option value="">All Vehicles</option>
          {vehicles?.map(v => (
            <option key={v.id} value={v.id}>{v.registrationNumber}</option>
          ))}
        </select>

        <select 
          value={filters.driverId || ''} 
          onChange={(e) => handleChange('driverId', e.target.value)}
          className="text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 outline-none"
        >
          <option value="">All Drivers</option>
          {drivers?.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select 
          value={filters.tripStatus || ''} 
          onChange={(e) => handleChange('tripStatus', e.target.value)}
          className="text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 outline-none"
        >
          <option value="">Trip Status (All)</option>
          <option value="Completed">Completed</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>

        <select 
          value={filters.expenseCategory || ''} 
          onChange={(e) => handleChange('expenseCategory', e.target.value)}
          className="text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 outline-none"
        >
          <option value="">Expense Category (All)</option>
          <option value="Fuel">Fuel</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Tolls">Tolls</option>
          <option value="Fines">Fines</option>
        </select>

        <select 
          value={filters.maintenanceType || ''} 
          onChange={(e) => handleChange('maintenanceType', e.target.value)}
          className="text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-2 py-2 outline-none"
        >
          <option value="">Maintenance Type (All)</option>
          <option value="Preventive">Preventive</option>
          <option value="Repair">Repair</option>
          <option value="Inspection">Inspection</option>
        </select>
      </div>
    </div>
  );
});

export default ReportFilters;
