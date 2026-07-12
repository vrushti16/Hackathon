import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

// UI components
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';

const initialExpenses = [
  { id: 'e-1', category: 'Fuel', amount: 180, vehicle: 'TX-9087-A', date: '2026-07-10', remarks: 'Refuel at Dallas hub' },
  { id: 'e-2', category: 'Maintenance', amount: 320, vehicle: 'FL-2104-D', date: '2026-07-08', remarks: 'Tire replacement' },
  { id: 'e-3', category: 'Parking', amount: 45, vehicle: 'CA-4521-B', date: '2026-07-07', remarks: 'Downtown parking' },
  { id: 'e-4', category: 'Insurance', amount: 2500, vehicle: 'NY-8890-C', date: '2026-07-05', remarks: 'Quarterly premium' }
];

const ExpensePage = React.memo(() => {
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

  const expenseColumns = [
    { key: 'amount', header: 'Amount', render: (value) => formatCurrency(value) },
    { key: 'vehicle', header: 'Vehicle' },
    { key: 'date', header: 'Date', render: (value) => formatDate(value) },
    { key: 'remarks', header: 'Remarks' },
    { key: 'category', header: 'Category' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Expense Management"
        subtitle="Track driver invoices, toll gates, fuel and general maintenance operational spend."
      >
        <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
          Add Expense
        </Button>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Monthly expenses"
          value={expenses.reduce((sum, item) => sum + item.amount, 0)}
          isCost={true}
        />
        <StatCard
          title="Today's expense"
          value={expenses[0]?.amount || 0}
          isCost={true}
        />
        <StatCard
          title="Vehicle average expense"
          value={Math.round(expenses.reduce((sum, item) => sum + item.amount, 0) / Math.max(1, expenses.length))}
          isCost={true}
        />
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchVal={search}
        onSearchChange={(event) => { setSearch(event.target.value); setPage(1); }}
        searchPlaceholder="Search expenses by vehicle, category..."
        onReset={search ? () => { setSearch(''); setPage(1); } : null}
      />

      {/* Table Container Card */}
      <Card>
        <Table 
          columns={expenseColumns} 
          data={pagedExpenses} 
          emptyState={
            <EmptyState 
              type="expenses" 
              actionText="Clear Filters" 
              onActionClick={() => { setSearch(''); setPage(1); }} 
            />
          } 
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* --- ADD EXPENSE MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense Details" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Category"
              id="category"
              name="category"
              options={['Fuel', 'Maintenance', 'Parking', 'Toll', 'Insurance', 'Other']}
              placeholder={null}
            />
            <Input 
              label="Amount" 
              id="amount"
              name="amount" 
              type="number"
              min="0"
              required 
            />
            <Input 
              label="Vehicle Registration" 
              id="vehicle"
              name="vehicle" 
              placeholder="e.g. TX-9087-A"
              required 
            />
            <Input 
              label="Transaction Date" 
              id="date"
              name="date" 
              type="date"
              required 
            />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="remarks" className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows="3"
              placeholder="Provide context for the transaction..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
});

export default ExpensePage;
