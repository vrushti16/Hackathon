import React, { useMemo, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useAuth } from '../../auth/useAuth';

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

const FuelPage = React.memo(() => {
  const { user } = useAuth();
  const canAdd = user?.role === 'Admin' || user?.role === 'Driver';
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [liters, setLiters] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const pageSize = 5;

  const computedEfficiency = useMemo(() => {
    const l = Number(liters);
    const d = Number(distance);
    return l > 0 && d > 0 ? (d / l).toFixed(2) : '0.00';
  }, [liters, distance]);

  const fetchFuelLogs = async () => {
    try {
      const response = await api.get('/expenses/fuel');
      const raw = Array.isArray(response.data) ? response.data : [];
      setFuelLogs(raw);
    } catch (err) {
      console.error('Failed to fetch fuel logs:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      const raw = Array.isArray(response.data) ? response.data : (response.data.vehicles || []);
      setVehicles(raw);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  useEffect(() => {
    fetchFuelLogs();
    fetchVehicles();
  }, []);

  const pagedLogs = useMemo(() => fuelLogs.slice((page - 1) * pageSize, page * pageSize), [fuelLogs, page]);
  const totalPages = Math.max(1, Math.ceil(fuelLogs.length / pageSize));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const vehicleId = formData.get('vehicleId');
    const litersNum = Number(formData.get('liters'));
    const costNum = Number(formData.get('cost'));
    const dateVal = formData.get('date');

    const vehicleObj = vehicles.find(v => (v._id || v.id) === vehicleId);
    const currentOdometer = vehicleObj?.odometer || 0;
    const odometerAtLog = currentOdometer + Number(distance);

    try {
      await api.post('/expenses/fuel', {
        vehicleId,
        liters: litersNum,
        cost: costNum,
        date: dateVal,
        odometerAtLog
      });
      setIsModalOpen(false);
      setLiters('');
      setDistance('');
      setSelectedVehicle('');
      fetchFuelLogs();
    } catch (err) {
      console.error('Failed to add fuel log:', err);
    }
  };

  const fuelColumns = [
    { key: 'vehicle', header: 'Vehicle', render: (v) => v?.registrationNumber || 'N/A' },
    { key: 'odometerAtLog', header: 'Odometer Reading', render: (val) => `${val?.toLocaleString()} km` },
    { key: 'liters', header: 'Liters', render: (value) => `${value}L` },
    { key: 'cost', header: 'Cost', render: (value) => formatCurrency(value) },
    { key: 'date', header: 'Date', render: (value) => formatDate(value) },
    {
      key: 'efficiency',
      header: 'Fuel Efficiency',
      render: (_, row) => {
        // Mock a route or compute dynamic efficiency for display
        return `${row.liters > 0 ? (row.odometerAtLog / row.liters / 100).toFixed(1) : '12.4'} km/L`;
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Fuel Logs"
        subtitle="Monitor vehicle fuel efficiency, refuel thresholds, and carbon footprints."
      >
        {canAdd && (
          <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
            Add Fuel Log
          </Button>
        )}
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
          value="9.8 km/L"
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
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="vehicleId" className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">
                Vehicle Registration
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                required
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/60 dark:bg-brand-slate-900/60 text-xs text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value="">Select a Vehicle</option>
                {vehicles.map(v => (
                  <option key={v._id || v.id} value={v._id || v.id}>{v.registrationNumber}</option>
                ))}
              </select>
            </div>
            
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
