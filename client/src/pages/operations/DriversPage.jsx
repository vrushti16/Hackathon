import React, { useMemo, useState } from 'react';
import { Plus, Search, Filter, AlertTriangle, ShieldAlert, BadgeCheck } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import DriverCard from '../../components/driver/DriverCard';
import { formatDate } from '../../utils/formatters';

const initialDrivers = [
  { id: 'd-1', name: 'Maya Chen', licenseNumber: 'DL-4021', category: 'Class A', expiryDate: '2026-09-12', contact: '+1 415 555 0188', safetyScore: 92, status: 'Available' },
  { id: 'd-2', name: 'Luis Ortega', licenseNumber: 'DL-2218', category: 'Class B', expiryDate: '2026-07-20', contact: '+1 310 555 0191', safetyScore: 78, status: 'On Trip' },
  { id: 'd-3', name: 'Nina Patel', licenseNumber: 'DL-8810', category: 'Class A', expiryDate: '2026-05-04', contact: '+1 646 555 0144', safetyScore: 88, status: 'Suspended' },
  { id: 'd-4', name: 'Owen Brooks', licenseNumber: 'DL-7765', category: 'Class C', expiryDate: '2026-11-10', contact: '+1 214 555 0112', safetyScore: 95, status: 'Off Duty' }
];

const DriversPage = () => {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const pageSize = 4;

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
      case 'Available': return 'bg-brand-green/10 text-brand-green';
      case 'On Trip': return 'bg-brand-blue/10 text-brand-blue';
      case 'Suspended': return 'bg-brand-red/10 text-brand-red';
      default: return 'bg-brand-slate-100 text-brand-slate-600';
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
    setIsModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleDeleteDriver = (id) => {
    setDrivers((prev) => prev.filter((driver) => driver.id !== id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextDriver = {
      id: selectedDriver?.id || `d-${Date.now()}`,
      name: formData.get('name'),
      licenseNumber: formData.get('licenseNumber'),
      category: formData.get('category'),
      expiryDate: formData.get('expiryDate'),
      contact: formData.get('contact'),
      safetyScore: Number(formData.get('safetyScore')),
      status: formData.get('status')
    };

    if (selectedDriver) {
      setDrivers((prev) => prev.map((driver) => driver.id === selectedDriver.id ? nextDriver : driver));
    } else {
      setDrivers((prev) => [nextDriver, ...prev]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', header: 'Driver Name', sortable: true, render: (value, row) => <div><p className="font-semibold text-brand-slate-800">{value}</p><p className="text-xs text-brand-slate-500">{row.category}</p></div> },
    { key: 'licenseNumber', header: 'License Number', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'expiryDate', header: 'Expiry Date', sortable: true, render: (value) => formatDate(value) },
    { key: 'contact', header: 'Contact' },
    { key: 'safetyScore', header: 'Safety Score', sortable: true, render: (value) => <div className="flex items-center gap-2"><div className="h-2 w-24 rounded-full bg-brand-slate-200"><div className="h-2 rounded-full bg-brand-blue" style={{ width: `${value}%` }} /></div><span>{value}</span></div> },
    { key: 'status', header: 'Status', sortable: true, render: (value) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(value)}`}>{value}</span> },
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => handleEditDriver(row)} className="rounded-lg border border-brand-slate-200 px-2 py-1 text-xs font-semibold text-brand-slate-700">Edit</button>
        <button onClick={() => handleDeleteDriver(row.id)} className="rounded-lg bg-brand-red/10 px-2 py-1 text-xs font-semibold text-brand-red">Delete</button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-slate-200 bg-white/70 p-5 shadow-sm dark:border-brand-slate-800 dark:bg-brand-slate-900/60 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Driver Management</p>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white">Enterprise driver operations</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleAddDriver} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-xl">
          <SearchBar value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search drivers" onClear={() => setSearch('')} />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-slate-200 bg-white/70 px-3 py-2 text-sm text-brand-slate-600">
          <Filter className="h-4 w-4" /> Sort & filter ready
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {drivers.slice(0, 3).map((driver) => {
          const licenseInfo = licenseState(driver.expiryDate, driver.status);
          const Icon = licenseInfo.icon;
          return (
            <div key={driver.id} className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-brand-slate-900">{driver.name}</p>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(driver.status)}`}>{driver.status}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-brand-slate-600">
                <Icon className={`h-4 w-4 ${licenseInfo.tone}`} /> <span className={licenseInfo.tone}>{licenseInfo.label}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-brand-slate-200">
                <div className="h-2 rounded-full bg-brand-blue" style={{ width: `${driver.safetyScore}%` }} />
              </div>
              <p className="mt-2 text-xs text-brand-slate-500">Safety score {driver.safetyScore}/100</p>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <Table columns={columns} data={pagedDrivers} sortKey={sortKey} sortOrder={sortOrder} onSort={(key, order) => { setSortKey(key); setSortOrder(order); setPage(1); }} emptyState={<EmptyState title="No drivers found" description="Add a driver to start tracking licensing and safety metrics." />} />
      </div>

      <div className="grid gap-4 lg:hidden">
        {pagedDrivers.length > 0 ? pagedDrivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} onView={() => setSelectedDriver(driver)} onEdit={handleEditDriver} onDelete={handleDeleteDriver} />
        )) : <EmptyState title="No drivers found" description="Add a driver to start tracking licensing and safety metrics." />}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDriver ? 'Edit Driver' : 'Add Driver'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Driver Name</label>
              <input defaultValue={selectedDriver?.name || ''} name="name" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">License Number</label>
              <input defaultValue={selectedDriver?.licenseNumber || ''} name="licenseNumber" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Category</label>
              <input defaultValue={selectedDriver?.category || ''} name="category" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Expiry Date</label>
              <input type="date" defaultValue={selectedDriver?.expiryDate || ''} name="expiryDate" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Contact</label>
              <input defaultValue={selectedDriver?.contact || ''} name="contact" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Safety Score</label>
              <input type="number" min="0" max="100" defaultValue={selectedDriver?.safetyScore || 90} name="safetyScore" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Status</label>
            <select defaultValue={selectedDriver?.status || 'Available'} name="status" className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm">
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-brand-slate-200 px-4 py-2 text-sm font-semibold text-brand-slate-700">Cancel</button>
            <button type="submit" className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Save Driver</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DriversPage;
