// Maintenance.jsx - Maintenance logs and tickets management
import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Wrench, 
  CheckCircle, 
  Clock, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  History,
  ClipboardList
} from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

// Zod validation schema for maintenance tickets
const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  type: z.string().min(1, 'Please select a maintenance type'),
  description: z.string().min(1, 'Description is required'),
  cost: z.coerce.number().nonnegative('Cost must be positive or 0'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  status: z.string().default('Open')
});

const MAINTENANCE_TYPES = ['Routine', 'Repair', 'Inspection', 'Emergency'];

const Maintenance = () => {
  const { 
    vehicles, 
    maintenance, 
    loading, 
    addMaintenance, 
    closeMaintenance 
  } = useFleet();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicleId: '',
      type: 'Routine',
      description: '',
      cost: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Open'
    }
  });

  // Split maintenance data into Active (Open) and History (Closed)
  const activeRecords = useMemo(() => {
    return maintenance.filter(m => m.status === 'Open' || m.status === 'Active');
  }, [maintenance]);

  const historyRecords = useMemo(() => {
    return maintenance.filter(m => m.status === 'Closed');
  }, [maintenance]);

  // Statistics for top header
  const stats = useMemo(() => {
    const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const activeCount = activeRecords.length;
    const avgTicketCost = maintenance.length > 0 ? Math.round(totalCost / maintenance.length) : 0;
    
    return {
      totalCost,
      activeCount,
      avgTicketCost
    };
  }, [maintenance, activeRecords]);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      await addMaintenance(data);
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      setFormError(err.message || 'Failed to file maintenance ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async (id) => {
    try {
      await closeMaintenance(id);
    } catch (err) {
      // Handled in context toasts
    }
  };

  // Helper to color code ticket types
  const getTypeBadge = (type) => {
    const styles = {
      Routine: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
      Repair: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      Inspection: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
      Emergency: 'bg-brand-red/10 text-brand-red border-brand-red/20'
    };

    return (
      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${styles[type] || 'bg-brand-slate-100 text-brand-slate-600'}`}>
        {type}
      </span>
    );
  };

  // Columns definition for Active maintenance
  const activeColumns = [
    {
      key: 'vehicleReg',
      header: 'Vehicle',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-brand-slate-900 dark:text-white px-2 py-0.5 rounded bg-brand-slate-100 dark:bg-brand-slate-800 text-[11px] block w-max">
            {val}
          </span>
          <span className="text-[10px] font-semibold text-brand-slate-400 dark:text-brand-slate-500 mt-1 block">
            {row.vehicleName}
          </span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (val) => getTypeBadge(val)
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      className: 'max-w-xs truncate',
      render: (val) => (
        <span className="text-xs text-brand-slate-600 dark:text-brand-slate-350 leading-relaxed block" title={val}>
          {val}
        </span>
      )
    },
    {
      key: 'cost',
      header: 'Estimated Cost',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-brand-slate-900 dark:text-white">
          ${val.toLocaleString()}
        </span>
      )
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (val) => (
        <div className="flex items-center space-x-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-brand-slate-400" />
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Ticket Status',
      sortable: false,
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => handleCloseTicket(row.id)}
          disabled={row.status === 'Closed'}
          type="button"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Complete Ticket</span>
        </button>
      )
    }
  ];

  // Columns definition for History maintenance
  const historyColumns = [
    {
      key: 'vehicleReg',
      header: 'Vehicle',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-brand-slate-800 dark:text-brand-slate-200 px-2 py-0.5 rounded bg-brand-slate-100 dark:bg-brand-slate-900 text-[10px] block w-max">
            {val}
          </span>
          <span className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500 mt-0.5 block truncate">
            {row.vehicleName}
          </span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (val) => getTypeBadge(val)
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      className: 'max-w-xs truncate',
      render: (val) => (
        <span className="text-xs text-brand-slate-500 dark:text-brand-slate-400 block" title={val}>
          {val}
        </span>
      )
    },
    {
      key: 'cost',
      header: 'Total Cost',
      sortable: true,
      render: (val) => `$${val.toLocaleString()}`
    },
    {
      key: 'startDate',
      header: 'Duration',
      sortable: false,
      render: (_, row) => (
        <div className="text-[11px] text-brand-slate-500">
          <p className="flex items-center space-x-1">
            <span className="font-bold text-brand-slate-400">In:</span>
            <span>{row.startDate}</span>
          </p>
          <p className="flex items-center space-x-1">
            <span className="font-bold text-brand-slate-400">Out:</span>
            <span>{row.endDate || 'N/A'}</span>
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: false,
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
            Maintenance Dispatch
          </h2>
          <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
            Schedule repairs, log diagnostics, and check service records.
          </p>
        </div>
        <button
          onClick={() => {
            reset({
              vehicleId: '',
              type: 'Routine',
              description: '',
              cost: '',
              startDate: new Date().toISOString().split('T')[0],
              endDate: '',
              status: 'Open'
            });
            setFormError('');
            setIsAddModalOpen(true);
          }}
          type="button"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Maintenance Ticket</span>
        </button>
      </div>

      {/* Top statistics summary panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-wider">Active Tickets</p>
            <p className="text-2xl font-bold text-brand-slate-800 dark:text-white font-display">{stats.activeCount}</p>
          </div>
        </div>
        
        <div className="glass-panel p-5 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-wider">Total Operations Spent</p>
            <p className="text-2xl font-bold text-brand-slate-800 dark:text-white font-display">${stats.totalCost.toLocaleString()}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-wider">Average Ticket Cost</p>
            <p className="text-2xl font-bold text-brand-slate-800 dark:text-white font-display">${stats.avgTicketCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stacked Panels: 1. Active Maintenance tickets */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center space-x-2">
          <ClipboardList className="w-4 h-4 text-brand-orange" />
          <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Active Service Tickets</h4>
        </div>
        
        <Table
          columns={activeColumns}
          data={activeRecords}
          isLoading={loading.maintenance}
          emptyState={
            <EmptyState
              icon={CheckCircle}
              title="All assets cleared"
              description="There are currently no active maintenance tickets. The entire fleet is operational!"
            />
          }
        />
      </div>

      {/* Stacked Panels: 2. Maintenance Service History */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-brand-blue" />
          <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Service Logs History</h4>
        </div>

        <Table
          columns={historyColumns}
          data={historyRecords}
          isLoading={loading.maintenance}
          emptyState={
            <EmptyState
              title="No historical tickets found"
              description="When service tickets are completed, they will appear in this historical register."
            />
          }
        />
      </div>

      {/* --- CREATE TICKET MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Vehicle Maintenance"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red text-xs font-bold">
              {formError}
            </div>
          )}

          {/* Vehicle Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Select Vehicle</label>
            <select
              {...register('vehicleId')}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer ${
                errors.vehicleId ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
              }`}
            >
              <option value="">Select vehicle for ticket...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.registrationNumber}) — {v.status}
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-[10px] text-brand-red font-semibold">{errors.vehicleId.message}</p>
            )}
            <p className="text-[10px] text-brand-slate-400 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-orange mr-1" />
              Scheduling a ticket will automatically update the vehicle's status to "In Shop"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Maintenance Type */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Maintenance Type</label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                {MAINTENANCE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Estimated Cost */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Estimated Cost ($)</label>
              <input
                type="number"
                placeholder="250"
                {...register('cost')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.cost ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.cost && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.cost.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.startDate ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.startDate && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date (optional initially) */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Target Resolution Date</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Service Description</label>
            <textarea
              rows={3}
              placeholder="Detail issues e.g. regular engine lube service, fluid flushes, oil filter checks..."
              {...register('description')}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none ${
                errors.description ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
              }`}
            />
            {errors.description && (
              <p className="text-[10px] text-brand-red font-semibold">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <button
              onClick={() => setIsAddModalOpen(false)}
              type="button"
              className="py-2 px-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 text-xs font-semibold text-brand-slate-600 dark:text-brand-slate-400 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? 'Creating Ticket...' : 'File Ticket'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Maintenance;
