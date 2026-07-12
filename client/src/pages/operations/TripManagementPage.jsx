import React, { useMemo, useState, useEffect } from 'react';
import { Plus, CheckCircle2, Truck, Users, MapPin, Clock3 } from 'lucide-react';
import TripModal from '../../components/trip/TripModal';
import TripStepper from '../../components/trip/TripStepper';
import Drawer from '../../components/common/Drawer';
import api from '../../services/api';
import { useAuth } from '../../auth/useAuth';

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

const TripManagementPage = React.memo(() => {
  const { user } = useAuth();
  const canCreate = user?.role === 'Admin' || user?.role === 'Driver';
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [page, setPage] = useState(1);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [tripIdToCancel, setTripIdToCancel] = useState(null);
  const pageSize = 5;

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      const raw = Array.isArray(response.data) ? response.data : [];
      setTrips(raw);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
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

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      const raw = Array.isArray(response.data) ? response.data : [];
      setDrivers(raw);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, []);

  const formattedVehicles = useMemo(() => vehicles.map(v => ({
    id: v._id || v.id,
    registrationNumber: v.registrationNumber,
    name: v.modelName || v.name || '',
    capacity: v.maxLoadCapacity || v.capacity || 0,
    odometer: v.odometer || 0,
    status: v.status || 'Available',
    type: v.type || ''
  })), [vehicles]);

  const formattedDrivers = useMemo(() => drivers.map(d => ({
    id: d._id || d.id,
    name: d.name,
    licenseNumber: d.licenseNumber,
    expiryDate: d.licenseExpiryDate,
    safetyScore: d.safetyScore,
    status: d.status,
    licenseCategory: d.licenseCategory || d.category || ''
  })), [drivers]);

  const normalizedTrips = useMemo(() => trips.map(t => ({
    id: t._id || t.id,
    vehicleId: t.vehicle?._id || t.vehicle,
    vehicleReg: t.vehicle?.registrationNumber || 'N/A',
    vehicleName: t.vehicle?.modelName || 'N/A',
    driverId: t.driver?._id || t.driver,
    driverName: t.driver?.name || 'N/A',
    source: t.source,
    destination: t.destination,
    cargoWeight: t.cargoWeight,
    distance: t.plannedDistance,
    revenue: t.revenueGenerated,
    status: t.status,
    fuelUsed: t.fuelConsumed || 0,
    odometer: t.finalOdometer || 0,
    notes: t.notes || 'N/A'
  })), [trips]);

  const pagedTrips = useMemo(() => normalizedTrips.slice((page - 1) * pageSize, page * pageSize), [page, normalizedTrips]);
  const totalPages = Math.max(1, Math.ceil(normalizedTrips.length / pageSize));

  const handleCreateTrip = async (values) => {
    const payload = {
      source: values.source,
      destination: values.destination,
      vehicleId: values.vehicleId,
      driverId: values.driverId,
      cargoWeight: values.cargoWeight,
      plannedDistance: values.distance,
      revenueGenerated: values.revenue,
      notes: values.notes || ''
    };

    try {
      await api.post('/trips', payload);
      fetchTrips();
      fetchVehicles();
      fetchDrivers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create trip:', err);
    }
  };

  const handleDispatchTrip = async (tripId) => {
    try {
      await api.post(`/trips/${tripId}/dispatch`);
      fetchTrips();
      fetchVehicles();
      fetchDrivers();
    } catch (err) {
      console.error('Failed to dispatch trip:', err);
    }
  };

  const handleCompleteTrip = async (trip) => {
    const planned = trip.distance || 100;
    const vehicleObj = vehicles.find(v => (v._id || v.id) === trip.vehicleId);
    const startOdometer = vehicleObj?.odometer || 0;
    const finalOdometer = startOdometer + planned;
    const fuelConsumed = Math.round(planned / 6);

    try {
      await api.post(`/trips/${trip.id}/complete`, {
        finalOdometer,
        fuelConsumed
      });
      fetchTrips();
      fetchVehicles();
      fetchDrivers();
    } catch (err) {
      console.error('Failed to complete trip:', err);
    }
  };

  const handleCancelClick = (id) => {
    setTripIdToCancel(id);
    setIsConfirmCancelOpen(true);
  };

  const handleConfirmCancelTrip = async () => {
    try {
      await api.post(`/trips/${tripIdToCancel}/cancel`);
      fetchTrips();
      fetchVehicles();
      fetchDrivers();
      setIsConfirmCancelOpen(false);
      setTripIdToCancel(null);
    } catch (err) {
      console.error('Failed to cancel trip:', err);
    }
  };

  const tripColumns = [
    { key: 'vehicleReg', header: 'Vehicle' },
    { key: 'driverName', header: 'Driver' },
    { key: 'cargoWeight', header: 'Cargo', render: (value) => `${value} kg` },
    { key: 'distance', header: 'Distance', render: (value) => `${value} km` },
    { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
    { key: 'actions', header: 'Dispatch', render: (_, row) => {
      const statusLower = row.status?.toLowerCase();
      return (
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleDispatchTrip(row.id)} 
            variant="primary" 
            size="sm" 
            disabled={statusLower === 'dispatched' || statusLower === 'completed' || statusLower === 'cancelled'}
          >
            Dispatch
          </Button>
          <Button 
            onClick={() => handleCompleteTrip(row)} 
            variant="outline" 
            size="sm" 
            className="text-brand-green hover:bg-brand-green/5 border-brand-green/10" 
            disabled={statusLower === 'completed' || statusLower === 'cancelled' || statusLower === 'draft'}
          >
            Complete
          </Button>
          <Button 
            onClick={() => handleCancelClick(row.id)} 
            variant="outline" 
            size="sm" 
            className="text-brand-red hover:bg-brand-red/5 border-brand-red/10" 
            disabled={statusLower === 'completed' || statusLower === 'cancelled'}
          >
            Cancel
          </Button>
        </div>
      );
    } }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Trip Dispatch"
        subtitle="Manage dispatch operations, live route tracking, and check delivery manifests."
      >
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
            Create Trip
          </Button>
        )}
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Vehicles"
          value={vehicles.filter((vehicle) => vehicle.status === 'On Trip' || vehicle.status === 'Active').length}
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
          {normalizedTrips.slice(0, 2).map((trip) => (
            <div key={trip.id} className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-50/50 dark:bg-brand-slate-900/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-brand-slate-900 dark:text-white">
                    {trip.vehicleReg} ({trip.vehicleName})
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
      {isModalOpen && (
        <TripModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          vehicles={formattedVehicles} 
          drivers={formattedDrivers} 
          onSubmit={handleCreateTrip} 
        />
      )}

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
});

export default TripManagementPage;
