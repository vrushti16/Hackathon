import React, { useMemo, useState } from 'react';
import { Plus, Fuel } from 'lucide-react';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const initialFuelLogs = [
  { id: 'f-1', vehicle: 'TX-9087-A', trip: 'Dallas → Austin', liters: 142, cost: 180, date: '2026-07-10', efficiency: '6.4 mpg' },
  { id: 'f-2', vehicle: 'CA-4521-B', trip: 'LA → San Diego', liters: 56, cost: 84, date: '2026-07-08', efficiency: '95 MPGe' },
  { id: 'f-3', vehicle: 'FL-2104-D', trip: 'Miami → Tampa', liters: 78, cost: 112, date: '2026-07-05', efficiency: '14.5 mpg' }
];

const FuelPage = React.memo(() => {
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const pagedLogs = useMemo(() => fuelLogs.slice((page - 1) * pageSize, page * pageSize), [fuelLogs, page]);
  const totalPages = Math.max(1, Math.ceil(fuelLogs.length / pageSize));

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextLog = {
      id: `f-${Date.now()}`,
      vehicle: formData.get('vehicle'),
      trip: formData.get('trip'),
      liters: Number(formData.get('liters')),
      cost: Number(formData.get('cost')),
      date: formData.get('date'),
      efficiency: `${formData.get('efficiency')} mpg`
    };
    setFuelLogs((prev) => [nextLog, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-slate-200 bg-white/70 p-5 shadow-sm dark:border-brand-slate-800 dark:bg-brand-slate-900/60 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Fuel Logs</p>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white">Monitor fuel usage and efficiency</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Add Fuel Log
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <p className="text-sm text-brand-slate-500">Total liters</p>
          <p className="mt-2 text-3xl font-bold text-brand-slate-900">{fuelLogs.reduce((sum, log) => sum + log.liters, 0)}L</p>
        </div>
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <p className="text-sm text-brand-slate-500">Total cost</p>
          <p className="mt-2 text-3xl font-bold text-brand-slate-900">{formatCurrency(fuelLogs.reduce((sum, log) => sum + log.cost, 0))}</p>
        </div>
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <p className="text-sm text-brand-slate-500">Efficiency target</p>
          <p className="mt-2 text-3xl font-bold text-brand-slate-900">9.8 mpg</p>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
        <Table columns={[
          { key: 'vehicle', header: 'Vehicle' },
          { key: 'trip', header: 'Trip' },
          { key: 'liters', header: 'Liters', render: (value) => `${value}L` },
          { key: 'cost', header: 'Cost', render: (value) => formatCurrency(value) },
          { key: 'date', header: 'Date', render: (value) => formatDate(value) },
          { key: 'efficiency', header: 'Fuel Efficiency' }
        ]} data={pagedLogs} emptyState={<EmptyState title="No fuel logs" description="Record the next refuel to keep the fleet efficient." />} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fuel Log" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-semibold">Vehicle</label><input name="vehicle" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Trip</label><input name="trip" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Liters</label><input type="number" min="0" name="liters" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Cost</label><input type="number" min="0" name="cost" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Date</label><input type="date" name="date" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Efficiency</label><input type="number" min="0" name="efficiency" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-brand-slate-200 px-4 py-2 text-sm font-semibold text-brand-slate-700">Cancel</button>
            <button type="submit" className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Save Log</button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

export default FuelPage;
