// Vehicles.jsx - Vehicles CRUD and Enterprise Data Table
import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  Car,
  Layers,
  MapPin,
  RefreshCw,
  Trash
} from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import StatusBadge from '../components/common/StatusBadge';
import SearchBar from '../components/common/SearchBar';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { formatCurrency } from '../utils/formatters';

// Zod Validation Schema for CRUD operations
const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required').toUpperCase(),
  name: z.string().min(1, 'Vehicle Name is required'),
  type: z.string().min(1, 'Type is required'),
  capacity: z.coerce.number().positive('Capacity must be greater than 0'),
  odometer: z.coerce.number().nonnegative('Odometer must be positive or 0'),
  acquisitionCost: z.coerce.number().positive('Acquisition cost must be positive'),
  region: z.string().min(1, 'Region is required'),
  status: z.string().default('Available')
});

const VEHICLE_TYPES = ['Heavy Duty Truck', 'Electric Van', 'Cargo Van', 'Box Truck', 'Sedan', 'SUV'];
const REGIONS = ['North America', 'West Coast', 'East Coast', 'South Region', 'Midwest', 'Europe'];

const Vehicles = React.memo(() => {
  const { 
    vehicles, 
    loading, 
    fetchVehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    bulkDeleteVehicles 
  } = useFleet();

  // Local Search & Filter & Paginate States
  const [searchQuery, setSearchQuery] = useState('');
  const [localTypeFilter, setLocalTypeFilter] = useState('All');
  const [localStatusFilter, setLocalStatusFilter] = useState('All');
  const [localRegionFilter, setLocalRegionFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal management states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null); // Vehicle being edited
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize React Hook Form for Add/Edit
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: '',
      name: '',
      type: 'Cargo Van',
      capacity: '',
      odometer: '',
      acquisitionCost: '',
      region: 'North America',
      status: 'Available'
    }
  });

  // Load edit vehicle values into form
  useEffect(() => {
    if (activeVehicle && isEditModalOpen) {
      reset({
        registrationNumber: activeVehicle.registrationNumber,
        name: activeVehicle.name,
        type: activeVehicle.type,
        capacity: activeVehicle.capacity,
        odometer: activeVehicle.odometer,
        acquisitionCost: activeVehicle.acquisitionCost,
        region: activeVehicle.region,
        status: activeVehicle.status
      });
    }
  }, [activeVehicle, isEditModalOpen, reset]);

  // Clean selections if page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [searchQuery, localTypeFilter, localStatusFilter, localRegionFilter, currentPage]);

  // --- Filtering & Sorting & Pagination Logic ---

  const filteredData = useMemo(() => {
    let result = [...vehicles];

    // Apply text search on name or registration number
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        v => v.name.toLowerCase().includes(q) || v.registrationNumber.toLowerCase().includes(q)
      );
    }

    // Apply drop filters
    if (localTypeFilter !== 'All') {
      result = result.filter(v => v.type === localTypeFilter);
    }
    if (localStatusFilter !== 'All') {
      result = result.filter(v => v.status === localStatusFilter);
    }
    if (localRegionFilter !== 'All') {
      result = result.filter(v => v.region === localRegionFilter);
    }

    // Apply Sorting
    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, localTypeFilter, localStatusFilter, localRegionFilter, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSort = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // --- Row Selections ---

  const handleSelectAll = () => {
    const pageIds = pagedData.map(v => v.id);
    const allSelectedOnPage = pageIds.every(id => selectedIds.includes(id));

    if (allSelectedOnPage) {
      // Unselect all on page
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Select all on page
      setSelectedIds(prev => {
        const next = [...prev];
        pageIds.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // --- Form Submissions ---

  const handleAddSubmit = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      await addVehicle(data);
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      setFormError(err.message || 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      await updateVehicle(activeVehicle.id, data);
      setIsEditModalOpen(false);
      setActiveVehicle(null);
      reset();
    } catch (err) {
      setFormError(err.message || 'Failed to update vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete handlers ---

  const handleConfirmSingleDelete = async () => {
    try {
      await deleteVehicle(idToDelete);
      setIdToDelete(null);
    } catch (err) {
      // handled inside context toasts
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await bulkDeleteVehicles(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      // handled inside context toasts
    }
  };

  // Columns definition for Table Component
  const columns = [
    {
      key: 'registrationNumber',
      header: 'Registration',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-brand-slate-900 dark:text-white px-2 py-1 rounded bg-brand-slate-100 dark:bg-brand-slate-800 text-xs">
          {val}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Vehicle Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-brand-slate-800 dark:text-white font-display">{val}</p>
            <p className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500">{row.region}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true
    },
    {
      key: 'capacity',
      header: 'Capacity (kg)',
      sortable: true,
      render: (val) => `${(val ?? 0).toLocaleString()} kg`
    },
    {
      key: 'odometer',
      header: 'Odometer',
      sortable: true,
      render: (val) => `${(val ?? 0).toLocaleString()} km`
    },
    {
      key: 'acquisitionCost',
      header: 'Acquisition Cost',
      sortable: true,
      render: (val) => formatCurrency(val ?? 0)
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveVehicle(row);
              setIsEditModalOpen(true);
            }}
            type="button"
            className="p-1.5 rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors cursor-pointer"
            title="Edit Vehicle"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIdToDelete(row.id);
              setIsConfirmDeleteOpen(true);
            }}
            type="button"
            className="p-1.5 rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 hover:text-brand-red hover:bg-brand-red/5 transition-colors cursor-pointer"
            title="Delete Vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
            Vehicles Inventory
          </h2>
          <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
            Monitor, edit, and expand TransitOps fleet assets.
          </p>
        </div>
        <button
          onClick={() => {
            reset({
              registrationNumber: '',
              name: '',
              type: 'Cargo Van',
              capacity: '',
              odometer: '',
              acquisitionCost: '',
              region: 'North America',
              status: 'Available'
            });
            setFormError('');
            setIsAddModalOpen(true);
          }}
          type="button"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl glass-panel">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          
          {/* Search bar component */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            onClear={() => setSearchQuery('')}
            placeholder="Search by name or registration..."
          />

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Type */}
            <select
              aria-label="Filter by Type"
              value={localTypeFilter}
              onChange={(e) => {
                setLocalTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-xs text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              {VEHICLE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              aria-label="Filter by Status"
              value={localStatusFilter}
              onChange={(e) => {
                setLocalStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-xs text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Active">Active</option>
              <option value="In Shop">In Shop</option>
            </select>

            {/* Filter by Region */}
            <select
              aria-label="Filter by Region"
              value={localRegionFilter}
              onChange={(e) => {
                setLocalRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-xs text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="All">All Regions</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Force Reload API list */}
            <button
              onClick={fetchVehicles}
              disabled={loading.vehicles}
              type="button"
              className="p-2 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 text-brand-slate-500 dark:text-brand-slate-400 hover:text-brand-blue hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 disabled:opacity-50 transition-colors cursor-pointer"
              title="Force Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading.vehicles ? 'animate-spin' : ''}`} />
            </button>

          </div>
        </div>

        {/* Selected Rows Banner for Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-red/5 border border-brand-red/20 animate-fade-in">
            <span className="text-xs font-semibold text-brand-red">
              {selectedIds.length} vehicle(s) selected
            </span>
            <button
              onClick={() => setIsConfirmBulkDeleteOpen(true)}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-red hover:bg-brand-red/90 transition-colors cursor-pointer"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Bulk Remove</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table view */}
      <Table
        columns={columns}
        data={pagedData}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        isLoading={loading.vehicles}
        emptyState={
          <EmptyState
            title="No vehicles found"
            description="We couldn't find any vehicles matching your requirements. Feel free to add a new asset to the inventory list."
            actionText="Clear Filters"
            onActionClick={() => {
              setSearchQuery('');
              setLocalTypeFilter('All');
              setLocalStatusFilter('All');
              setLocalRegionFilter('All');
            }}
          />
        }
      />

      {/* Table Pagination */}
      {!loading.vehicles && filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* --- ADD VEHICLE MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Asset to Fleet"
      >
        <form onSubmit={handleSubmit(handleAddSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red text-xs font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Registration Number</label>
              <input
                type="text"
                placeholder="TX-9087-A"
                {...register('registrationNumber')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.registrationNumber ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.registrationNumber && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.registrationNumber.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Vehicle Name</label>
              <input
                type="text"
                placeholder="Freightliner Cascadia"
                {...register('name')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.name ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.name && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Vehicle Type</label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                {VEHICLE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Operating Region</label>
              <select
                {...register('region')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Maximum Capacity (kg)</label>
              <input
                type="number"
                placeholder="25000"
                {...register('capacity')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.capacity ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.capacity && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.capacity.message}</p>
              )}
            </div>

            {/* Odometer */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Current Odometer (mi)</label>
              <input
                type="number"
                placeholder="12000"
                {...register('odometer')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.odometer ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.odometer && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.odometer.message}</p>
              )}
            </div>

            {/* Cost */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Acquisition Cost (₹)</label>
              <input
                type="number"
                placeholder="85000"
                {...register('acquisitionCost')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.acquisitionCost ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.acquisitionCost && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.acquisitionCost.message}</p>
              )}
            </div>

            {/* Initial Status */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Initial Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="Active">Active</option>
                <option value="In Shop">In Shop</option>
              </select>
            </div>
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
              {submitting ? 'Creating...' : 'Save Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT VEHICLE MODAL --- */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setActiveVehicle(null);
        }}
        title={`Edit Vehicle: ${activeVehicle?.name || ''}`}
      >
        <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red text-xs font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Registration Number</label>
              <input
                type="text"
                {...register('registrationNumber')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.registrationNumber ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.registrationNumber && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.registrationNumber.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Vehicle Name</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.name ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.name && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Vehicle Type</label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                {VEHICLE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Operating Region</label>
              <select
                {...register('region')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Maximum Capacity (kg)</label>
              <input
                type="number"
                {...register('capacity')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.capacity ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.capacity && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.capacity.message}</p>
              )}
            </div>

            {/* Odometer */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Current Odometer (mi)</label>
              <input
                type="number"
                {...register('odometer')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.odometer ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.odometer && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.odometer.message}</p>
              )}
            </div>

            {/* Cost */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Acquisition Cost (₹)</label>
              <input
                type="number"
                {...register('acquisitionCost')}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.acquisitionCost ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                }`}
              />
              {errors.acquisitionCost && (
                <p className="text-[10px] text-brand-red font-semibold">{errors.acquisitionCost.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Vehicle Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="Active">Active</option>
                <option value="In Shop">In Shop</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setActiveVehicle(null);
              }}
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
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- SINGLE DELETE CONFIRMATION --- */}
      <ConfirmationDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={handleConfirmSingleDelete}
        title="Remove Fleet Asset"
        message="Are you sure you want to permanently delete this vehicle from the inventory? This will also clear all active maintenance orders associated with it."
      />

      {/* --- BULK DELETE CONFIRMATION --- */}
      <ConfirmationDialog
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Remove Selected Assets"
        message={`Are you sure you want to permanently delete these ${selectedIds.length} selected vehicles from the inventory? This action is irreversible.`}
      />

    </div>
  );
});

export default Vehicles;
