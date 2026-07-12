// Vehicles.jsx - Vehicles CRUD and Enterprise Data Table
import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  RefreshCw,
  Trash
} from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../auth/useAuth';
import { formatCurrency } from '../utils/formatters';

import useDebounce from '../hooks/useDebounce';

// UI components
import PageHeader from '../components/ui/PageHeader';
import FilterBar from '../components/ui/FilterBar';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

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

  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Fleet Manager';
  const canDelete = user?.role === 'Admin';

  // Local Search & Filter & Paginate States
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
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

  // Fetch vehicles once on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Autofill forms on edit trigger
  useEffect(() => {
    if (activeVehicle) {
      setValue('registrationNumber', activeVehicle.registrationNumber || '');
      setValue('name', activeVehicle.name || '');
      setValue('type', activeVehicle.type || 'Cargo Van');
      setValue('capacity', activeVehicle.capacity || '');
      setValue('odometer', activeVehicle.odometer || 0);
      setValue('acquisitionCost', activeVehicle.acquisitionCost || '');
      setValue('region', activeVehicle.region || 'North America');
      setValue('status', activeVehicle.status || 'Available');
    }
  }, [activeVehicle, setValue]);

  // --- Filtering & Sorting & Paging Logic ---

  const filteredData = useMemo(() => {
    let result = [...vehicles];

    // 1. Text Search matching (using debounced query)
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(v => 
        (v.name && v.name.toLowerCase().includes(q)) || 
        (v.registrationNumber && v.registrationNumber.toLowerCase().includes(q))
      );
    }

    // 2. Dropdown type matching
    if (localTypeFilter !== 'All') {
      result = result.filter(v => v.type === localTypeFilter);
    }

    // 3. Dropdown status matching
    if (localStatusFilter !== 'All') {
      result = result.filter(v => v.status === localStatusFilter);
    }

    // 4. Dropdown region matching
    if (localRegionFilter !== 'All') {
      result = result.filter(v => v.region === localRegionFilter);
    }

    // 5. Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortKey];
      const fieldB = b[sortKey];

      if (fieldA === undefined || fieldB === undefined) return 0;

      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }

      const strA = String(fieldA).toLowerCase();
      const strB = String(fieldB).toLowerCase();

      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, localTypeFilter, localStatusFilter, localRegionFilter, sortKey, sortOrder]);

  // Page slice calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const pagedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSort = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  // --- Row Checkbox selections ---

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
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Title & Add Button */}
      <PageHeader
        title="Vehicles Inventory"
        subtitle="Monitor, edit, and expand TransitOps fleet assets."
      >
        {canManage && (
          <Button
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
            icon={Plus}
            variant="primary"
          >
            Add Vehicle
          </Button>
        )}
      </PageHeader>

      {/* Search and Filters panel */}
      <FilterBar
        searchVal={searchQuery}
        onSearchChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name or registration..."
        onReset={
          searchQuery || localTypeFilter !== 'All' || localStatusFilter !== 'All' || localRegionFilter !== 'All'
            ? () => {
                setSearchQuery('');
                setLocalTypeFilter('All');
                setLocalStatusFilter('All');
                setLocalRegionFilter('All');
                setCurrentPage(1);
              }
            : null
        }
      >
        {/* Filter by Type */}
        <select
          value={localTypeFilter}
          onChange={(e) => {
            setLocalTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-xs font-semibold text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none cursor-pointer"
        >
          <option value="All">All Types</option>
          {VEHICLE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Filter by Status */}
        <select
          value={localStatusFilter}
          onChange={(e) => {
            setLocalStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-xs font-semibold text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Active">Active</option>
          <option value="In Shop">In Shop</option>
        </select>

        {/* Filter by Region */}
        <select
          value={localRegionFilter}
          onChange={(e) => {
            setLocalRegionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-xs font-semibold text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none cursor-pointer"
        >
          <option value="All">All Regions</option>
          {REGIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Force Refresh */}
        <Button
          onClick={fetchVehicles}
          disabled={loading.vehicles}
          variant="outline"
          size="sm"
          icon={RefreshCw}
        />
      </FilterBar>

      {/* Selected Rows Banner for Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-brand-red/5 border border-brand-red/20 animate-fade-in">
          <span className="text-xs font-semibold text-brand-red">
            {selectedIds.length} vehicle(s) selected
          </span>
          <Button
            onClick={() => setIsConfirmBulkDeleteOpen(true)}
            variant="danger"
            size="sm"
            icon={Trash}
          >
            Bulk Remove
          </Button>
        </div>
      )}

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
            type="vehicles"
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              id="registrationNumber"
              placeholder="TX-9087-A"
              {...register('registrationNumber')}
              error={errors.registrationNumber?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Vehicle Name"
              id="name"
              placeholder="Freightliner Cascadia"
              {...register('name')}
              error={errors.name?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Select
              label="Vehicle Type"
              id="type"
              options={VEHICLE_TYPES}
              placeholder={null}
              {...register('type')}
              error={errors.type?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Select
              label="Operating Region"
              id="region"
              options={REGIONS}
              placeholder={null}
              {...register('region')}
              error={errors.region?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Maximum Capacity (kg)"
              id="capacity"
              type="number"
              placeholder="25000"
              {...register('capacity')}
              error={errors.capacity?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Current Odometer (mi)"
              id="odometer"
              type="number"
              placeholder="12000"
              {...register('odometer')}
              error={errors.odometer?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Acquisition Cost (₹)"
              id="acquisitionCost"
              type="number"
              placeholder="85000"
              {...register('acquisitionCost')}
              error={errors.acquisitionCost?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Select
              label="Initial Status"
              id="status"
              options={['Available', 'Active', 'In Shop']}
              placeholder={null}
              {...register('status')}
              error={errors.status?.message}
              className="col-span-2 sm:col-span-1"
            />
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
              Save Asset
            </Button>
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              id="edit-registrationNumber"
              {...register('registrationNumber')}
              error={errors.registrationNumber?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Vehicle Name"
              id="edit-name"
              {...register('name')}
              error={errors.name?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Select
              label="Vehicle Type"
              id="edit-type"
              options={VEHICLE_TYPES}
              placeholder={null}
              {...register('type')}
              error={errors.type?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Select
              label="Operating Region"
              id="edit-region"
              options={REGIONS}
              placeholder={null}
              {...register('region')}
              error={errors.region?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Maximum Capacity (kg)"
              id="edit-capacity"
              type="number"
              {...register('capacity')}
              error={errors.capacity?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Current Odometer (mi)"
              id="edit-odometer"
              type="number"
              {...register('odometer')}
              error={errors.odometer?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Input
              label="Acquisition Cost (₹)"
              id="edit-acquisitionCost"
              type="number"
              {...register('acquisitionCost')}
              error={errors.acquisitionCost?.message}
              className="col-span-2 sm:col-span-1"
            />

            <Select
              label="Vehicle Status"
              id="edit-status"
              options={['Available', 'Active', 'In Shop']}
              placeholder={null}
              {...register('status')}
              error={errors.status?.message}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setActiveVehicle(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              variant="primary"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- SINGLE DELETE CONFIRMATION --- */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={handleConfirmSingleDelete}
        title="Remove Fleet Asset"
        message="Are you sure you want to permanently delete this vehicle from the inventory? This will also clear all active maintenance orders associated with it."
        confirmText="Remove Asset"
        isDanger={true}
      />

      {/* --- BULK DELETE CONFIRMATION --- */}
      <ConfirmDialog
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Remove Selected Assets"
        message={`Are you sure you want to permanently delete these ${selectedIds.length} selected vehicles from the inventory? This action is irreversible.`}
        confirmText="Remove Selected"
        isDanger={true}
      />

    </div>
  );
});

export default Vehicles;
