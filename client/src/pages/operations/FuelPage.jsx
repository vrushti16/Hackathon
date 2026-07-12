import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

// UI components
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';

const initialFuelLogs = [
  { id: 'f-1', vehicle: 'TX-9087-A', trip: 'Dallas → Austin', liters: 142, cost: 180, date: '2026-07-10', efficiency: '6.4 mpg' },
  { id: 'f-2', vehicle: 'CA-4521-B', trip: 'LA → San Diego', liters: 56, cost: 84, date: '2026-07-08', efficiency: '95 MPGe' },
  { id: 'f-3', vehicle: 'FL-2104-D', trip: 'Miami → Tampa', liters: 78, cost: 112, date: '2026-07-05', efficiency: '14.5 mpg' }
];

const FuelPage = React.memo(() => {
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [liters, setLiters] = useState('');
  const [distance, setDistance] = useState('');
  const pageSize = 5;

  const computedEfficiency = useMemo(() => {
    const l = Number(liters);
    const d = Number(distance);
    return l > 0 && d > 0 ? (d / l).toFixed(2) : '0.00';
  }, [liters, distance]);

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
      efficiency: `${computedEfficiency} km/L`
    };
    setFuelLogs((prev) => [nextLog, ...prev]);
    setIsModalOpen(false);
    setLiters('');
    setDistance('');
  };

  const fuelColumns = [
    { key: 'vehicle', header: 'Vehicle' },
    { key: 'trip', header: 'Trip' },
    { key: 'liters', header: 'Liters', render: (value) => `${value}L` },
    { key: 'cost', header: 'Cost', render: (value) => formatCurrency(value) },
    { key: 'date', header: 'Date', render: (value) => formatDate(value) },
    { key: 'efficiency', header: 'Fuel Efficiency' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Fuel Logs"
        subtitle="Monitor vehicle fuel efficiency, refuel thresholds, and carbon footprints."
      >
        <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
          Add Fuel Log
        </Button>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Liters Refueled"
          value={`${fuelLogs.reduce((sum, log) => sum + log.liters, 0)}L`}
          trend={0}
        />
        <StatCard
          title="Total Fuel Cost"
          value={fuelLogs.reduce((sum, log) => sum + log.cost, 0)}
          isCost={true}
        />
        <StatCard
          title="Efficiency Target"
          value="9.8 mpg"
          trend={12}
          trendLabel="optimal fleet score"
        />
      </div>

      {/* Table Container Card */}
      <Card>
        <Table 
          columns={fuelColumns} 
          data={pagedLogs} 
          emptyState={
            <EmptyState 
              title="No fuel logs found" 
              description="Record the next vehicle refuel log to keep efficiency indicators active." 
            />
          } 
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* --- ADD FUEL LOG MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fuel Log Entry" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input 
              label="Vehicle Registration" 
              id="vehicle"
              name="vehicle" 
              placeholder="e.g. TX-9087-A"
              required 
            />
            <Input 
              label="Trip Route" 
              id="trip"
              name="trip" 
              placeholder="e.g. Dallas to Houston"
              required 
            />
            <Input 
              label="Liters Refueled" 
              id="liters"
              name="liters" 
              type="number"
              min="0"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              required 
            />
            <Input 
              label="Refuel Cost (₹)" 
              id="cost"
              name="cost" 
              type="number"
              min="0"
              required 
            />
            <Input 
              label="Log Date" 
              id="date"
              name="date" 
              type="date"
              required 
            />
            <Input 
              label="Distance Traveled (km)" 
              id="distance"
              name="distance" 
              type="number"
              min="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required 
            />
            <div className="md:col-span-2">
              <Input 
                label="System Calculated Efficiency" 
                id="efficiency"
                name="efficiency" 
                value={`${computedEfficiency} km/L`}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Log
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
});

export default FuelPage;
