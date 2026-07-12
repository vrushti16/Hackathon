import React, { useMemo, useState } from 'react';
import { Plus, CheckCircle2, Truck, Users, MapPin, Clock3 } from 'lucide-react';
import TripModal from '../../components/trip/TripModal';
import TripStepper from '../../components/trip/TripStepper';
import Drawer from '../../components/common/Drawer';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

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
  const pageSize = 5;

  const pagedTrips = useMemo(() => trips.slice((page - 1) * pageSize, page * pageSize), [page, trips]);
  const totalPages = Math.max(1, Math.ceil(trips.length / pageSize));

  const handleCreateTrip = (values) => {
    const vehicle = vehicles.find((item) => item.id === values.vehicleId);
    const driver = drivers.find((item) => item.id === values.driverId);
    const nextTrip = { id: `t-${Date.now()}`, ...values, vehicleId: values.vehicleId, driverId: values.driverId, status: 'Draft', fuelUsed: 0, odometer: vehicle?.odometer || 0, notes: values.notes || '' };
    setTrips((prev) => [nextTrip, ...prev]);
  };

  const updateTripStatus = (tripId, status) => {
    setTrips((prev) => prev.map((trip) => trip.id === tripId ? { ...trip, status } : trip));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-slate-200 bg-white/70 p-5 shadow-sm dark:border-brand-slate-800 dark:bg-brand-slate-900/60 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Trip Dispatch</p>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white">Dispatch workflow with live validation</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Create Trip
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <div className="flex items-center gap-2 text-brand-blue"><Truck className="h-4 w-4" /> <span className="text-sm font-semibold">Active vehicles</span></div>
          <p className="mt-3 text-3xl font-bold text-brand-slate-900">{vehicles.filter((vehicle) => vehicle.status === 'Active').length}</p>
        </div>
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <div className="flex items-center gap-2 text-brand-green"><Users className="h-4 w-4" /> <span className="text-sm font-semibold">Available drivers</span></div>
          <p className="mt-3 text-3xl font-bold text-brand-slate-900">{drivers.filter((driver) => driver.status === 'Available').length}</p>
        </div>
        <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
          <div className="flex items-center gap-2 text-brand-orange"><MapPin className="h-4 w-4" /> <span className="text-sm font-semibold">Trips in progress</span></div>
          <p className="mt-3 text-3xl font-bold text-brand-slate-900">{trips.filter((trip) => trip.status === 'Dispatched').length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
        <Table columns={[
          { key: 'vehicleId', header: 'Vehicle', render: (value) => vehicles.find((vehicle) => vehicle.id === value)?.registrationNumber || value },
          { key: 'driverId', header: 'Driver', render: (value) => drivers.find((driver) => driver.id === value)?.name || value },
          { key: 'cargoWeight', header: 'Cargo', render: (value) => `${value} kg` },
          { key: 'distance', header: 'Distance', render: (value) => `${value} km` },
          { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
          { key: 'actions', header: 'Dispatch', render: (_, row) => (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateTripStatus(row.id, 'Dispatched')} className="rounded-lg bg-brand-blue px-2.5 py-1.5 text-xs font-semibold text-white">Dispatch</button>
              <button onClick={() => updateTripStatus(row.id, 'Completed')} className="rounded-lg bg-brand-green/10 px-2.5 py-1.5 text-xs font-semibold text-brand-green">Complete</button>
              <button onClick={() => updateTripStatus(row.id, 'Cancelled')} className="rounded-lg bg-brand-red/10 px-2.5 py-1.5 text-xs font-semibold text-brand-red">Cancel</button>
            </div>
          ) }
        ]} data={pagedTrips} emptyState={<EmptyState title="No trips scheduled" description="Create a dispatch to start tracking the operation." />} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <div className="rounded-2xl border border-brand-slate-200 bg-white/70 p-4">
        <div className="flex items-center gap-2 text-brand-slate-700"><Clock3 className="h-4 w-4" /> <span className="text-sm font-semibold">Timeline preview</span></div>
        <div className="mt-4">
          {trips.slice(0, 2).map((trip) => (
            <div key={trip.id} className="mb-4 rounded-2xl border border-brand-slate-200 bg-brand-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-slate-900">{vehicles.find((vehicle) => vehicle.id === trip.vehicleId)?.registrationNumber}</p>
                  <p className="text-sm text-brand-slate-500">{trip.source} → {trip.destination}</p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
              <div className="mt-4"><TripStepper status={trip.status} /></div>
            </div>
          ))}
        </div>
      </div>

      <TripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vehicles={vehicles} drivers={drivers} onSubmit={handleCreateTrip} />

      <Drawer isOpen={!!selectedTrip} onClose={() => setSelectedTrip(null)} title="Trip Detail">
        {selectedTrip && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand-slate-200 bg-brand-slate-50 p-4">
              <p className="text-sm text-brand-slate-500">Route</p>
              <p className="mt-1 text-lg font-semibold text-brand-slate-900">{selectedTrip.source} → {selectedTrip.destination}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-brand-slate-200 p-4">
                <p className="text-sm text-brand-slate-500">Fuel Used</p>
                <p className="text-xl font-semibold text-brand-slate-900">{selectedTrip.fuelUsed}L</p>
              </div>
              <div className="rounded-2xl border border-brand-slate-200 p-4">
                <p className="text-sm text-brand-slate-500">Revenue</p>
                <p className="text-xl font-semibold text-brand-slate-900">${selectedTrip.revenue}</p>
              </div>
              <div className="rounded-2xl border border-brand-slate-200 p-4">
                <p className="text-sm text-brand-slate-500">Distance</p>
                <p className="text-xl font-semibold text-brand-slate-900">{selectedTrip.distance} km</p>
              </div>
              <div className="rounded-2xl border border-brand-slate-200 p-4">
                <p className="text-sm text-brand-slate-500">Odometer</p>
                <p className="text-xl font-semibold text-brand-slate-900">{selectedTrip.odometer}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-slate-200 p-4">
              <div className="flex items-center gap-2 text-brand-blue"><CheckCircle2 className="h-4 w-4" /> <span className="text-sm font-semibold">Trip notes</span></div>
              <p className="mt-2 text-sm text-brand-slate-600">{selectedTrip.notes}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TripManagementPage;
