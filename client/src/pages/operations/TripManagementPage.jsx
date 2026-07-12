import React, { useMemo, useState } from 'react';
import { Plus, CheckCircle2, Truck, Users, MapPin, Clock3 } from 'lucide-react';
import TripModal from '../../components/trip/TripModal';
import TripStepper from '../../components/trip/TripStepper';
import Drawer from '../../components/common/Drawer';

// UI components
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const initialVehicles = [
  { id: 'v-1', registrationNumber: 'TX-9087-A', name: 'Freightliner Cascadia', capacity: 25000, status: 'Active' },
  { id: 'v-2', registrationNumber: 'CA-4521-B', name: 'Ford E-Transit Van', capacity: 3500, status: 'Available' },
  { id: 'v-3', registrationNumber: 'NY-8890-C', name: 'Volvo VNL 860', capacity: 26000, status: 'In Shop' }
];

const initialDrivers = [
  { id: 'd-1', name: 'Maya Chen', licenseNumber: 'DL-4021', expiryDate: '2026-09-12', safetyScore: 92, status: 'Available' },
  { id: 'd-2', name: 'Luis Ortega', licenseNumber: 'DL-2218', expiryDate: '2026-07-20', safetyScore: 78, status: 'On Trip' },
  { id: 'd-3', name: 'Nina Patel', licenseNumber: 'DL-8810', expiryDate: '2026-05-04', safetyScore: 88, status: 'Suspended' }
];

const initialTrips = [
  { id: 't-1', vehicleId: 'v-1', driverId: 'd-1', source: 'Dallas Hub', destination: 'Austin Depot', cargoWeight: 18000, distance: 320, revenue: 4800, status: 'Dispatched', fuelUsed: 142, odometer: 145600, notes: 'Temperature-sensitive freight' },
  { id: 't-2', vehicleId: 'v-2', driverId: 'd-2', source: 'LA Port', destination: 'San Diego', cargoWeight: 3200, distance: 160, revenue: 2100, status: 'Completed', fuelUsed: 56, odometer: 18320, notes: 'Same-day delivery' },
  { id: 't-3', vehicleId: 'v-3', driverId: 'd-3', source: 'Boston Yard', destination: 'New York', cargoWeight: 22000, distance: 240, revenue: 3600, status: 'Draft', fuelUsed: 0, odometer: 289500, notes: 'Pending dispatch' }
];

const TripManagementPage = () => {
  const [trips, setTrips] = useState(initialTrips);
  const [vehicles] = useState(initialVehicles);
  const [drivers] = useState(initialDrivers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [page, setPage] = useState(1);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [tripIdToCancel, setTripIdToCancel] = useState(null);
  const pageSize = 5;

  const pagedTrips = useMemo(() => trips.slice((page - 1) * pageSize, page * pageSize), [page, trips]);
  const totalPages = Math.max(1, Math.ceil(trips.length / pageSize));

  const handleCreateTrip = (values) => {
    const vehicle = vehicles.find((item) => item.id === values.vehicleId);
    const nextTrip = { id: `t-${Date.now()}`, ...values, vehicleId: values.vehicleId, driverId: values.driverId, status: 'Draft', fuelUsed: 0, odometer: vehicle?.odometer || 0, notes: values.notes || '' };
    setTrips((prev) => [nextTrip, ...prev]);
  };

  const updateTripStatus = (tripId, status) => {
    setTrips((prev) => prev.map((trip) => trip.id === tripId ? { ...trip, status } : trip));
  };

  const handleCancelClick = (id) => {
    setTripIdToCancel(id);
    setIsConfirmCancelOpen(true);
  };

  const handleConfirmCancelTrip = () => {
    updateTripStatus(tripIdToCancel, 'Cancelled');
    setIsConfirmCancelOpen(false);
    setTripIdToCancel(null);
  };

  const tripColumns = [
    { key: 'vehicleId', header: 'Vehicle', render: (value) => vehicles.find((vehicle) => vehicle.id === value)?.registrationNumber || value },
    { key: 'driverId', header: 'Driver', render: (value) => drivers.find((driver) => driver.id === value)?.name || value },
    { key: 'cargoWeight', header: 'Cargo', render: (value) => `${value} kg` },
    { key: 'distance', header: 'Distance', render: (value) => `${value} km` },
    { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
    { key: 'actions', header: 'Dispatch', render: (_, row) => (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => updateTripStatus(row.id, 'Dispatched')} variant="primary" size="sm" disabled={row.status === 'Dispatched' || row.status === 'Completed' || row.status === 'Cancelled'}>
          Dispatch
        </Button>
        <Button onClick={() => updateTripStatus(row.id, 'Completed')} variant="outline" size="sm" className="text-brand-green hover:bg-brand-green/5 border-brand-green/10" disabled={row.status === 'Completed' || row.status === 'Cancelled'}>
          Complete
        </Button>
        <Button onClick={() => handleCancelClick(row.id)} variant="outline" size="sm" className="text-brand-red hover:bg-brand-red/5 border-brand-red/10" disabled={row.status === 'Completed' || row.status === 'Cancelled'}>
          Cancel
        </Button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Trip Dispatch"
        subtitle="Manage dispatch operations, live route tracking, and check delivery manifests."
      >
        <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
          Create Trip
        </Button>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Vehicles"
          value={vehicles.filter((vehicle) => vehicle.status === 'Active').length}
          icon={Truck}
        />
        <StatCard
          title="Available Drivers"
          value={drivers.filter((driver) => driver.status === 'Available').length}
          icon={Users}
        />
        <StatCard
          title="Trips In Progress"
          value={trips.filter((trip) => trip.status === 'Dispatched').length}
          icon={MapPin}
        />
      </div>

      {/* Table Container Card */}
      <Card>
        <Table 
          columns={tripColumns} 
          data={pagedTrips} 
          emptyState={
            <EmptyState 
              type="trips" 
              actionText="Schedule Trip" 
              onActionClick={() => setIsModalOpen(true)} 
            />
          } 
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Timeline Section */}
      <Card
        title="Timeline Preview"
        icon={Clock3}
      >
        <div className="space-y-4">
          {trips.slice(0, 2).map((trip) => (
            <div key={trip.id} className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-50/50 dark:bg-brand-slate-900/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-brand-slate-900 dark:text-white">
                    {vehicles.find((vehicle) => vehicle.id === trip.vehicleId)?.registrationNumber}
                  </p>
                  <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
                    {trip.source} → {trip.destination}
                  </p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
              <TripStepper status={trip.status} />
            </div>
          ))}
        </div>
      </Card>

      {/* Trip Form Modal */}
      <TripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        vehicles={vehicles} 
        drivers={drivers} 
        onSubmit={handleCreateTrip} 
      />

      {/* Trip Detail Drawer */}
      <Drawer isOpen={!!selectedTrip} onClose={() => setSelectedTrip(null)} title="Trip Detail">
        {selectedTrip && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-50/50 dark:bg-brand-slate-900/50 p-4">
              <p className="text-xs text-brand-slate-500">Route</p>
              <p className="mt-1 text-sm font-bold text-brand-slate-900 dark:text-white">{selectedTrip.source} → {selectedTrip.destination}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 p-4">
                <p className="text-xs text-brand-slate-500">Fuel Used</p>
                <p className="text-base font-bold text-brand-slate-900 dark:text-white font-mono">{selectedTrip.fuelUsed}L</p>
              </div>
              <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 p-4">
                <p className="text-xs text-brand-slate-500">Revenue</p>
                <p className="text-base font-bold text-brand-slate-900 dark:text-white font-mono">₹{selectedTrip.revenue}</p>
              </div>
              <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 p-4">
                <p className="text-xs text-brand-slate-500">Distance</p>
                <p className="text-base font-bold text-brand-slate-900 dark:text-white font-mono">{selectedTrip.distance} km</p>
              </div>
              <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 p-4">
                <p className="text-xs text-brand-slate-500">Odometer</p>
                <p className="text-base font-bold text-brand-slate-900 dark:text-white font-mono">{selectedTrip.odometer}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 p-4">
              <div className="flex items-center gap-2 text-brand-blue">
                <CheckCircle2 className="h-4 w-4" /> 
                <span className="text-xs font-semibold">Trip notes</span>
              </div>
              <p className="mt-2 text-xs text-brand-slate-600 dark:text-brand-slate-400">{selectedTrip.notes}</p>
            </div>
          </div>
        )}
      </Drawer>

      {/* --- CONFIRM CANCEL DIALOG --- */}
      <ConfirmDialog
        isOpen={isConfirmCancelOpen}
        onClose={() => {
          setIsConfirmCancelOpen(false);
          setTripIdToCancel(null);
        }}
        onConfirm={handleConfirmCancelTrip}
        title="Cancel Trip Dispatch"
        message="Are you sure you want to cancel this scheduled trip dispatch? This action is irreversible."
        confirmText="Cancel Trip"
        isDanger={true}
      />

    </div>
  );
};

export default TripManagementPage;
