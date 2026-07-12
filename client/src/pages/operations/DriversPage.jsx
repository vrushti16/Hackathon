import React, { useMemo, useState, useEffect } from 'react';
import { Plus, AlertTriangle, ShieldAlert, BadgeCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

// UI components
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DriverCard from '../../components/driver/DriverCard';

const DriversPage = React.memo(() => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [driverIdToDelete, setDriverIdToDelete] = useState(null);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [errorMsg, setErrorMsg] = useState(null);
  const pageSize = 4;

  const normalizeDriver = (d) => ({
    id: d._id || d.id,
    name: d.name,
    licenseNumber: d.licenseNumber,
    category: d.licenseCategory,
    expiryDate: d.licenseExpiryDate ? d.licenseExpiryDate.substring(0, 10) : '',
    contact: d.contactNumber,
    safetyScore: d.safetyScore ?? 100,
    status: d.status || 'Available',
    email: d.email || ''
  });

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      const raw = Array.isArray(response.data) ? response.data : [];
      setDrivers(raw.map(normalizeDriver));
    } catch (err) {
      console.error('Failed to load drivers:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return drivers
      .filter((driver) => [driver.name, driver.licenseNumber, driver.category, driver.status].some((value) => String(value).toLowerCase().includes(searchTerm)))
      .sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        const order = sortOrder === 'asc' ? 1 : -1;
        return String(aValue).localeCompare(String(bValue)) * order;
      });
  }, [drivers, search, sortKey, sortOrder]);

  const pagedDrivers = filteredDrivers.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));

  const statusTone = (status) => {
    switch (status) {
      case 'Available': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'On Trip': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Suspended': return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      default: return 'bg-brand-slate-100 dark:bg-brand-slate-900 text-brand-slate-600 dark:text-brand-slate-400 border-brand-slate-250 dark:border-brand-slate-850';
    }
  };

  const licenseState = (expiryDate, status) => {
    if (status === 'Suspended') return { label: 'Suspended', icon: ShieldAlert, tone: 'text-brand-red' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', icon: AlertTriangle, tone: 'text-brand-red' };
    if (diffDays <= 30) return { label: 'Expiring Soon', icon: AlertTriangle, tone: 'text-brand-orange' };
    return { label: 'Valid', icon: BadgeCheck, tone: 'text-brand-green' };
  };

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDeleteDriverClick = (id) => {
    setDriverIdToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteDriver = async () => {
    try {
      await api.delete(`/drivers/${driverIdToDelete}`);
      setDrivers((prev) => prev.filter((driver) => driver.id !== driverIdToDelete));
      setIsConfirmDeleteOpen(false);
      setDriverIdToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete driver');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(event.currentTarget);
    
    const payload = {
      name: formData.get('name'),
      email: formData.get('email') || undefined,
      licenseNumber: formData.get('licenseNumber'),
      licenseCategory: formData.get('category'),
      licenseExpiryDate: formData.get('expiryDate'),
      contactNumber: formData.get('contact'),
      safetyScore: Number(formData.get('safetyScore')),
      status: formData.get('status')
    };

    try {
      if (selectedDriver) {
        const response = await api.put(`/drivers/${selectedDriver.id}`, payload);
        const updated = normalizeDriver(response.data);
        setDrivers((prev) => prev.map((driver) => driver.id === selectedDriver.id ? updated : driver));
      } else {
        const response = await api.post('/drivers', payload);
        const created = normalizeDriver(response.data);
        setDrivers((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Validation error while saving driver.');
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Driver Name', 
      sortable: true, 
      render: (value, row) => (
        <div>
          <p className="font-bold text-brand-slate-800 dark:text-white">{value}</p>
          <p className="text-[10px] font-semibold text-brand-slate-400 dark:text-brand-slate-500 mt-0.5">{row.category}</p>
        </div>
      ) 
    },
    { key: 'licenseNumber', header: 'License Number', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'expiryDate', header: 'Expiry Date', sortable: true, render: (value) => formatDate(value) },
    { key: 'contact', header: 'Contact' },
    { 
      key: 'safetyScore', 
      header: 'Safety Score', 
      sortable: true, 
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-brand-slate-200 dark:bg-brand-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-brand-blue" style={{ width: `${value}%` }} />
          </div>
          <span className="font-bold text-brand-slate-700 dark:text-brand-slate-350">{value}</span>
        </div>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true, 
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${statusTone(value)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
          {value}
        </span>
      ) 
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (_, row) => (
        <div className="flex gap-2">
          <Button onClick={() => handleEditDriver(row)} variant="outline" size="sm">
            Edit
          </Button>
          <Button onClick={() => handleDeleteDriverClick(row.id)} variant="outline" size="sm" className="text-brand-red hover:bg-brand-red/5 border-brand-red/10">
            Delete
          </Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Driver Management"
        subtitle="Manage fleet driver registrations, licensing safety compliance, and roster tracking."
      >
        <Button onClick={handleAddDriver} icon={Plus} variant="primary">
          Add Driver
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <FilterBar
        searchVal={search}
        onSearchChange={(event) => { setSearch(event.target.value); setPage(1); }}
        searchPlaceholder="Search drivers by name, category..."
        onReset={search ? () => { setSearch(''); setPage(1); } : null}
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.slice(0, 3).map((driver) => {
          const licenseInfo = licenseState(driver.expiryDate, driver.status);
          const Icon = licenseInfo.icon;
          return (
            <Card
              key={driver.id}
              title={driver.name}
              action={
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${statusTone(driver.status)}`}>
                  {driver.status}
                </span>
              }
            >
              <div className="flex items-center gap-2 text-xs font-semibold mt-1">
                <Icon className={`h-4 w-4 ${licenseInfo.tone}`} /> 
                <span className={licenseInfo.tone}>{licenseInfo.label}</span>
              </div>
              <div className="mt-4">
                <div className="h-1.5 rounded-full bg-brand-slate-200 dark:bg-brand-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-blue" style={{ width: `${driver.safetyScore}%` }} />
                </div>
                <p className="mt-2 text-[10px] text-brand-slate-500 font-bold">Safety score {driver.safetyScore}/100</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Table 
          columns={columns} 
          data={pagedDrivers} 
          sortKey={sortKey} 
          sortOrder={sortOrder} 
          onSort={(key, order) => { setSortKey(key); setSortOrder(order); setPage(1); }} 
          emptyState={
            <EmptyState 
              type="drivers" 
              actionText="Clear Filters" 
              onActionClick={() => { setSearch(''); setPage(1); }} 
            />
          } 
        />
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 lg:hidden">
        {pagedDrivers.length > 0 ? pagedDrivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} onView={() => setSelectedDriver(driver)} onEdit={handleEditDriver} onDelete={handleDeleteDriverClick} />
        )) : (
          <EmptyState 
            type="drivers" 
            actionText="Clear Filters" 
            onActionClick={() => { setSearch(''); setPage(1); }} 
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* --- ADD / EDIT DRIVER MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDriver ? 'Edit Driver Details' : 'Add New Driver'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-medium">
              {errorMsg}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Input 
              label="Driver Name" 
              id="name"
              name="name" 
              defaultValue={selectedDriver?.name || ''} 
              required 
            />
            <Input 
              label="Email Address (Optional)" 
              id="email"
              name="email" 
              type="email"
              defaultValue={selectedDriver?.email || ''} 
            />
            <Input 
              label="License Number" 
              id="licenseNumber"
              name="licenseNumber" 
              defaultValue={selectedDriver?.licenseNumber || ''} 
              required 
            />
            <Input 
              label="Category" 
              id="category"
              name="category" 
              defaultValue={selectedDriver?.category || ''} 
              placeholder="e.g. Class A, Class B"
              required 
            />
            <Input 
              label="Expiry Date" 
              id="expiryDate"
              name="expiryDate" 
              type="date"
              defaultValue={selectedDriver?.expiryDate || ''} 
              required 
            />
            <Input 
              label="Contact Number" 
              id="contact"
              name="contact" 
              defaultValue={selectedDriver?.contact || ''} 
              placeholder="+1 555 0199"
              required 
            />
            <Input 
              label="Safety Score (0-100)" 
              id="safetyScore"
              name="safetyScore" 
              type="number"
              min="0"
              max="100"
              defaultValue={selectedDriver?.safetyScore || 90} 
              required 
            />
          </div>
          
          <Select
            label="Roster Status"
            id="status"
            name="status"
            defaultValue={selectedDriver?.status || 'Available'}
            options={['Available', 'On Trip', 'Off Duty', 'Suspended']}
            placeholder={null}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Driver
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setDriverIdToDelete(null);
        }}
        onConfirm={handleConfirmDeleteDriver}
        title="Delete Driver Profile"
        message="Are you sure you want to permanently delete this driver profile? This action cannot be undone."
        confirmText="Delete Profile"
        isDanger={true}
      />

    </div>
  );
});

export default DriversPage;
