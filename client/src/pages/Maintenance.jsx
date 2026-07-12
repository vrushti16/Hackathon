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

// UI Components
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

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

const Maintenance = React.memo(() => {
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

  // Fetch data on load
  useEffect(() => {
    // Context automatically fetches, but ensure we have them
  }, []);

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
        <span className="font-bold text-brand-slate-900 dark:text-white font-mono">
          ₹{val.toLocaleString()}
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
        <Button
          onClick={() => handleCloseTicket(row.id)}
          disabled={row.status === 'Closed'}
          variant="outline"
          size="sm"
          icon={CheckCircle}
          className="text-brand-green hover:bg-brand-green/5 border-brand-green/15"
        >
          Complete Ticket
        </Button>
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
      render: (val) => `₹${val.toLocaleString()}`
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

  const vehicleOptions = useMemo(() => {
    return vehicles.map(v => ({
      value: v.id,
      label: `${v.name} (${v.registrationNumber}) — ${v.status}`
    }));
  }, [vehicles]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Title & Add Button */}
      <PageHeader
        title="Maintenance Dispatch"
        subtitle="Schedule repairs, log diagnostics, and check service records."
      >
        <Button
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
          icon={Plus}
          variant="primary"
        >
          New Maintenance Ticket
        </Button>
      </PageHeader>

      {/* Top statistics summary panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Active Tickets"
          value={stats.activeCount}
          icon={Clock}
          trend={0}
          trendLabel="pending resolution"
          isLoading={loading.maintenance}
        />
        
        <StatCard
          title="Total Operations Spent"
          value={stats.totalCost}
          icon={DollarSign}
          isCost={true}
          trend={5}
          trendLabel="vs last month"
          isLoading={loading.maintenance}
        />

        <StatCard
          title="Average Ticket Cost"
          value={stats.avgTicketCost}
          icon={TrendingUp}
          isCost={true}
          trend={-2}
          trendLabel="per maintenance log"
          isLoading={loading.maintenance}
        />
      </div>

      {/* Stacked Panels: 1. Active Maintenance tickets */}
      <Card
        title="Active Service Tickets"
        icon={ClipboardList}
      >
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
      </Card>

      {/* Stacked Panels: 2. Maintenance Service History */}
      <Card
        title="Service Logs History"
        icon={History}
      >
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
      </Card>

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
          <Select
            label="Select Vehicle"
            id="vehicleId"
            options={vehicleOptions}
            placeholder="Select vehicle for ticket..."
            {...register('vehicleId')}
            error={errors.vehicleId?.message}
            helperText="Scheduling a ticket will automatically update the vehicle's status to 'In Shop'"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Maintenance Type */}
            <Select
              label="Maintenance Type"
              id="type"
              options={MAINTENANCE_TYPES}
              placeholder={null}
              {...register('type')}
              error={errors.type?.message}
              className="col-span-2 sm:col-span-1"
            />

            {/* Estimated Cost */}
            <Input
              label="Estimated Cost (₹)"
              id="cost"
              type="number"
              placeholder="250"
              {...register('cost')}
              error={errors.cost?.message}
              className="col-span-2 sm:col-span-1"
            />

            {/* Start Date */}
            <Input
              label="Start Date"
              id="startDate"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
              className="col-span-2 sm:col-span-1"
            />

            {/* End Date */}
            <Input
              label="Target Resolution Date"
              id="endDate"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">
              Service Description
            </label>
            <textarea
              id="description"
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
            <Button
              onClick={() => setIsAddModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              variant="primary"
            >
              File Ticket
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
});

export default Maintenance;
