import React, { useMemo, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const initialExpenses = [
  { id: 'e-1', category: 'Fuel', amount: 180, vehicle: 'TX-9087-A', date: '2026-07-10', remarks: 'Refuel at Dallas hub' },
  { id: 'e-2', category: 'Maintenance', amount: 320, vehicle: 'FL-2104-D', date: '2026-07-08', remarks: 'Tire replacement' },
  { id: 'e-3', category: 'Parking', amount: 45, vehicle: 'CA-4521-B', date: '2026-07-07', remarks: 'Downtown parking' },
  { id: 'e-4', category: 'Insurance', amount: 2500, vehicle: 'NY-8890-C', date: '2026-07-05', remarks: 'Quarterly premium' }
];

const ExpensePage = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const filteredExpenses = useMemo(() => {
    const term = search.toLowerCase();
    return expenses.filter((item) => [item.category, item.vehicle, item.remarks].some((value) => String(value).toLowerCase().includes(term)));
  }, [expenses, search]);

  const pagedExpenses = useMemo(() => filteredExpenses.slice((page - 1) * pageSize, page * pageSize), [filteredExpenses, page]);
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setExpenses((prev) => [{ id: `e-${Date.now()}`, category: formData.get('category'), amount: Number(formData.get('amount')), vehicle: formData.get('vehicle'), date: formData.get('date'), remarks: formData.get('remarks') }, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-slate-200 bg-white/70 p-5 shadow-sm dark:border-brand-slate-800 dark:bg-brand-slate-900/60 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Expense Management</p>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white">Track invoices, tolls, and maintenance spend</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <p className="text-sm text-brand-slate-500">Monthly expenses</p>
          <p className="mt-2 text-3xl font-bold text-brand-slate-900">{formatCurrency(expenses.reduce((sum, item) => sum + item.amount, 0))}</p>
        </div>
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <p className="text-sm text-brand-slate-500">Today&apos;s expense</p>
          <p className="mt-2 text-3xl font-bold text-brand-slate-900">{formatCurrency(expenses[0]?.amount || 0)}</p>
        </div>
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <p className="text-sm text-brand-slate-500">Vehicle expense</p>
          <p className="mt-2 text-3xl font-bold text-brand-slate-900">{formatCurrency(expenses.reduce((sum, item) => sum + item.amount, 0) / Math.max(1, expenses.length))}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBar value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search expenses" onClear={() => setSearch('')} />
        <div className="flex items-center gap-2 rounded-xl border border-brand-slate-200 bg-white/70 px-3 py-2 text-sm text-brand-slate-600">
          <Filter className="h-4 w-4" /> Filters ready
        </div>
      </div>

      <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
        <Table columns={[
          { key: 'amount', header: 'Amount', render: (value) => formatCurrency(value) },
          { key: 'vehicle', header: 'Vehicle' },
          { key: 'date', header: 'Date', render: (value) => formatDate(value) },
          { key: 'remarks', header: 'Remarks' },
          { key: 'category', header: 'Category' }
        ]} data={pagedExpenses} emptyState={<EmptyState title="No expenses logged" description="Capture a new expense to keep the monthly budget up to date." />} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-semibold">Category</label><select name="category" className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm"><option value="Fuel">Fuel</option><option value="Maintenance">Maintenance</option><option value="Parking">Parking</option><option value="Toll">Toll</option><option value="Insurance">Insurance</option><option value="Other">Other</option></select></div>
            <div><label className="mb-1 block text-sm font-semibold">Amount</label><input type="number" min="0" name="amount" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Vehicle</label><input name="vehicle" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-semibold">Date</label><input type="date" name="date" required className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
          </div>
          <div><label className="mb-1 block text-sm font-semibold">Remarks</label><textarea name="remarks" rows="3" className="w-full rounded-xl border border-brand-slate-200 px-3 py-2.5 text-sm" /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-brand-slate-200 px-4 py-2 text-sm font-semibold text-brand-slate-700">Cancel</button>
            <button type="submit" className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Save Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensePage;
