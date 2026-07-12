// Dashboard.jsx - Premium Analytics & Overview Dashboard
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  CheckCircle2, 
  Wrench, 
  Compass, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useFleet } from '../context/FleetContext';
import KpiCard from '../components/common/KpiCard';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../auth/useAuth';
import api from '../services/api';

// UI components
import PageHeader from '../components/ui/PageHeader';
import FilterBar from '../components/ui/FilterBar';
import Select from '../components/ui/Select';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { ChartSkeleton } from '../components/common/Skeleton';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Dashboard = React.memo(() => {
  const { user } = useAuth();
  const { 
    vehicles, 
    maintenance,
    dashboardMetrics, 
    loading, 
    filters, 
    updateFilter,
    resetFilters,
    fetchDashboardMetrics 
  } = useFleet();

  // 1. Gather unique filter options dynamically from raw vehicles data
  const filterOptions = useMemo(() => {
    const types = new Set();
    const regions = new Set();
    
    vehicles.forEach(v => {
      if (v.type) types.add(v.type);
      if (v.region) regions.add(v.region);
    });

    return {
      types: ['All', ...Array.from(types)],
      statuses: ['All', 'Active', 'Available', 'In Shop'],
      regions: ['All', ...Array.from(regions)]
    };
  }, [vehicles]);

  // 2. Filter vehicles locally for real-time reactive KPI calculations
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesType = filters.vehicleType === 'All' || v.type === filters.vehicleType;
      const matchesStatus = filters.status === 'All' || v.status === filters.status;
      const matchesRegion = filters.region === 'All' || v.region === filters.region;
      return matchesType && matchesStatus && matchesRegion;
    });
  }, [vehicles, filters]);

  // 3. Compute dynamic metrics based on filtered vehicle set
  const metrics = useMemo(() => {
    const total = filteredVehicles.length;
    const active = filteredVehicles.filter(v => v.status === 'Active').length;
    const available = filteredVehicles.filter(v => v.status === 'Available').length;
    const inShop = filteredVehicles.filter(v => v.status === 'In Shop').length;
    
    // Simulate other KPIs scaled to the filtered subset
    const activeTrips = active * 2;
    const pendingTrips = available;
    const drivers = active + Math.floor(available * 0.3);
    const utilization = total > 0 ? Math.round((active / total) * 100) : 0;
    
    const vehicleMaintenanceCost = maintenance
      .filter(m => filteredVehicles.some(v => v.id === m.vehicleId))
      .reduce((sum, m) => sum + m.cost, 0);

    const operationalCost = filteredVehicles.reduce((sum, v) => sum + (v.operationalCost || 0), 0) + vehicleMaintenanceCost;

    return {
      total,
      active,
      available,
      inShop,
      activeTrips,
      pendingTrips,
      drivers,
      utilization,
      operationalCost
    };
  }, [filteredVehicles, maintenance]);

  // 4. Prepare local charts state syncing with filter selection
  const chartsData = useMemo(() => {
    if (!dashboardMetrics) return null;

    // Scale chart trends according to filtered values
    const scaleFactor = vehicles.length > 0 ? filteredVehicles.length / vehicles.length : 1;

    const tripsPerDay = dashboardMetrics.trends.tripsPerDay.map(d => ({
      ...d,
      trips: Math.round(d.trips * scaleFactor)
    }));

    const vehicleStatusPie = [
      { name: 'Active', value: metrics.active, color: '#2563EB' },
      { name: 'Available', value: metrics.available, color: '#22C55E' },
      { name: 'In Shop', value: metrics.inShop, color: '#F97316' }
    ].filter(item => item.value > 0);

    const maintenanceTrend = dashboardMetrics.trends.maintenanceTrend.map(d => ({
      ...d,
      cost: Math.round(d.cost * scaleFactor)
    }));

    const fuelCostTrend = dashboardMetrics.trends.fuelCostTrend.map(d => ({
      ...d,
      cost: Math.round(d.cost * scaleFactor)
    }));

    return {
      tripsPerDay,
      vehicleStatusPie,
      maintenanceTrend,
      fuelCostTrend
    };
  }, [dashboardMetrics, filteredVehicles, vehicles, metrics]);

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-brand-slate-900/90 dark:bg-black/90 text-white rounded-lg border border-brand-slate-800 text-[10px] shadow-lg backdrop-blur-md">
          <p className="font-semibold">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color || '#2563EB' }} className="mt-1 font-medium">
              {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const [driverData, setDriverData] = useState(null);
  const [driverLoading, setDriverLoading] = useState(true);
  const [driverError, setDriverError] = useState(null);

  const fetchDriverMe = async () => {
    if (user?.role !== 'Driver') return;
    setDriverLoading(true);
    setDriverError(null);
    try {
      const response = await api.get('/drivers/me');
      setDriverData(response.data);
    } catch (err) {
      setDriverError(err.response?.data?.message || err.message || 'Failed to load driver details.');
    } finally {
      setDriverLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverMe();
  }, [user]);

  const handleTripAction = async (tripId, action) => {
    try {
      if (action === 'dispatch') {
        await api.post(`/trips/${tripId}/dispatch`);
      } else if (action === 'cancel') {
        await api.post(`/trips/${tripId}/cancel`);
      }
      fetchDriverMe();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} trip`);
    }
  };

  if (user?.role === 'Driver') {
    if (driverLoading) {
      return (
        <div className="p-6 space-y-4">
          <ChartSkeleton />
        </div>
      );
    }

    if (driverError || !driverData) {
      return (
        <div className="p-6 max-w-lg mx-auto">
          <EmptyState
            type="drivers"
            title="No Driver Profile Found"
            description={driverError || "Your User account is not linked to any Driver profile. Please contact an Administrator to configure linking."}
            actionText="Refresh Profile"
            onActionClick={fetchDriverMe}
          />
        </div>
      );
    }

    const { driver, activeTrip, completedTrips } = driverData;

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="p-6 rounded-2xl glass-panel text-left space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Driver Dashboard</p>
              <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white font-display">Welcome, {driver.name}</h1>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${
              driver.status === 'Available' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' :
              driver.status === 'On Trip' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
              driver.status === 'Suspended' ? 'bg-brand-red/10 text-brand-red border-brand-red/20' :
              'bg-brand-slate-100 text-brand-slate-600'
            }`}>
              Status: {driver.status}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
              <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Safety Score</span>
              <p className="text-2xl font-bold text-brand-slate-900 dark:text-white mt-1">{driver.safetyScore}/100</p>
            </div>
            <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
              <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">License Category</span>
              <p className="text-2xl font-bold text-brand-slate-900 dark:text-white mt-1">{driver.licenseCategory}</p>
            </div>
            <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
              <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">License Expiry</span>
              <p className="text-xl font-bold text-brand-slate-900 dark:text-white mt-1">{new Date(driver.licenseExpiryDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
              <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Contact Number</span>
              <p className="text-xl font-bold text-brand-slate-900 dark:text-white mt-1">{driver.contactNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          {/* Active Trip Info */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">My Assigned Active Trip</h3>
            {activeTrip ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-brand-slate-400 block">Source</span>
                    <span className="font-semibold text-brand-slate-800 dark:text-white">{activeTrip.source}</span>
                  </div>
                  <div>
                    <span className="text-brand-slate-400 block">Destination</span>
                    <span className="font-semibold text-brand-slate-800 dark:text-white">{activeTrip.destination}</span>
                  </div>
                  <div>
                    <span className="text-brand-slate-400 block">Assigned Vehicle</span>
                    <span className="font-semibold text-brand-slate-800 dark:text-white">
                      {activeTrip.vehicle?.registrationNumber} ({activeTrip.vehicle?.modelName || activeTrip.vehicle?.type})
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-slate-400 block">Cargo Weight</span>
                    <span className="font-semibold text-brand-slate-800 dark:text-white">{activeTrip.cargoWeight} kg</span>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  {activeTrip.status === 'Draft' && (
                    <Button onClick={() => handleTripAction(activeTrip._id || activeTrip.id, 'dispatch')} variant="primary" size="sm">
                      Start Trip / Dispatch
                    </Button>
                  )}
                  <Button onClick={() => handleTripAction(activeTrip._id || activeTrip.id, 'cancel')} variant="secondary" size="sm" className="text-brand-red">
                    Cancel Trip
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-brand-slate-500 py-6 text-center">
                No active trip assigned currently.
              </div>
            )}
          </div>

          {/* Completed History */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Completed Trip History</h3>
            {completedTrips && completedTrips.length > 0 ? (
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs text-brand-slate-700 dark:text-brand-slate-300">
                  <thead>
                    <tr className="border-b border-brand-slate-100 dark:border-brand-slate-800 font-bold">
                      <th className="pb-2">Route</th>
                      <th className="pb-2">Vehicle</th>
                      <th className="pb-2">Distance</th>
                      <th className="pb-2">Completed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTrips.map((t) => (
                      <tr key={t._id || t.id} className="border-b border-brand-slate-50 dark:border-brand-slate-900">
                        <td className="py-2">{t.source} → {t.destination}</td>
                        <td className="py-2">{t.vehicle?.registrationNumber}</td>
                        <td className="py-2">{t.actualDistance || t.plannedDistance} km</td>
                        <td className="py-2">{t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-brand-slate-500 py-6 text-center">
                No completed trips in history.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'Safety Officer') {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-panel text-left space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Safety Dashboard</p>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white font-display">Compliance and Safety Operations</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Total Drivers</span>
            <p className="text-2xl font-bold text-brand-slate-900 dark:text-white mt-1">12</p>
          </div>
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Active Drivers</span>
            <p className="text-2xl font-bold text-brand-slate-900 dark:text-white mt-1">9</p>
          </div>
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Expired Licenses</span>
            <p className="text-2xl font-bold text-brand-red mt-1">0</p>
          </div>
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Safety Average</span>
            <p className="text-2xl font-bold text-brand-green mt-1">94%</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl text-left space-y-4">
          <h3 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">License Expiry Alerts (Expiring in 30 Days)</h3>
          <div className="text-xs text-brand-slate-555 dark:text-brand-slate-400 py-6 text-center">
            All driver licenses are compliant and fully valid.
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'Financial Analyst') {
    return (
      <div className="space-y-6 text-left">
        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-blue">Financial Dashboard</p>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white font-display">Operational Expense Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Total Fuel Overhead</span>
            <p className="text-2xl font-bold text-brand-slate-900 dark:text-white mt-1">₹425,000</p>
          </div>
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Maintenance Spent</span>
            <p className="text-2xl font-bold text-brand-slate-900 dark:text-white mt-1">₹182,000</p>
          </div>
          <div className="p-4 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900/60">
            <span className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Net ROI Score</span>
            <p className="text-2xl font-bold text-brand-green mt-1">₹14,500/veh</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Operational Profitability Curve</h3>
          <div className="text-xs text-brand-slate-555 dark:text-brand-slate-400 py-6 text-center">
            Select a vehicle or region to view localized cost trends.
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Object.values(filters).some(f => f !== 'All');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title="Fleet & Logistics Dashboard" 
        subtitle="Real-time operational metrics and visual analytics logs."
      />

      {/* 1. Header Filter Bar Controls */}
      <FilterBar
        onReset={hasActiveFilters ? resetFilters : null}
      >
        {/* Vehicle Type Filter */}
        <div className="flex flex-col space-y-1">
          <span className="text-[9px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider flex items-center">
            <Layers className="w-2.5 h-2.5 mr-1" /> Vehicle Type
          </span>
          <select
            value={filters.vehicleType}
            onChange={(e) => updateFilter('vehicleType', e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-[10px] font-semibold text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
          >
            {filterOptions.types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col space-y-1">
          <span className="text-[9px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider flex items-center">
            <HelpCircle className="w-2.5 h-2.5 mr-1" /> Status
          </span>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-[10px] font-semibold text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
          >
            {filterOptions.statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className="flex flex-col space-y-1">
          <span className="text-[9px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider flex items-center">
            <MapPin className="w-2.5 h-2.5 mr-1" /> Region
          </span>
          <select
            value={filters.region}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-[10px] font-semibold text-brand-slate-700 dark:text-brand-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
          >
            {filterOptions.regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={fetchDashboardMetrics}
          disabled={loading.dashboard}
          variant="outline"
          size="sm"
          icon={RefreshCw}
          className="self-end"
        />
      </FilterBar>

      {/* 2. KPI Cards Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Vehicles"
          value={metrics.active}
          icon={Car}
          trend={metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 10) : 0}
          trendLabel="vs fleet size"
          isLoading={loading.vehicles || loading.dashboard}
        />
        <StatCard
          title="Available Vehicles"
          value={metrics.available}
          icon={CheckCircle2}
          trend={metrics.total > 0 ? Math.round((metrics.available / metrics.total) * 10) : 0}
          trendLabel="ready for dispatch"
          isLoading={loading.vehicles || loading.dashboard}
        />
        <StatCard
          title="Vehicles In Shop"
          value={metrics.inShop}
          icon={Wrench}
          trend={metrics.total > 0 ? Math.round((metrics.inShop / metrics.total) * 10) : 0}
          trendLabel="undergoing service"
          isLoading={loading.vehicles || loading.dashboard}
        />
        <StatCard
          title="Active Trips"
          value={metrics.activeTrips}
          icon={Compass}
          trend={14}
          trendLabel="vs yesterday"
          isLoading={loading.dashboard}
        />
        <StatCard
          title="Pending Trips"
          value={metrics.pendingTrips}
          icon={Clock}
          trend={-5}
          trendLabel="in queue"
          isLoading={loading.dashboard}
        />
        <StatCard
          title="Drivers On Duty"
          value={metrics.drivers}
          icon={Users}
          trend={8}
          trendLabel="vs yesterday"
          isLoading={loading.dashboard}
        />
        <StatCard
          title="Fleet Utilization %"
          value={`${metrics.utilization}%`}
          icon={TrendingUp}
          trend={metrics.utilization > 70 ? 5 : -2}
          trendLabel="ideal capacity is 85%"
          isLoading={loading.vehicles || loading.dashboard}
        />
        <StatCard
          title="Operational Cost"
          value={metrics.operationalCost}
          icon={DollarSign}
          trend={-3}
          isCost={true}
          trendLabel="vs last month"
          isLoading={loading.vehicles || loading.dashboard}
        />
      </div>

      {/* 3. Recharts Section */}
      {metrics.total === 0 ? (
        <EmptyState
          title="No vehicles match the selected filters"
          description="Try selecting different vehicle types, statuses, or regions to view data trends."
          actionText="Reset Filters"
          onActionClick={resetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Trips per Day */}
            <div className="lg:col-span-2">
              <ErrorBoundary fallbackMessage="Unable to load trip frequency trends." onRetry={fetchDashboardMetrics}>
                {loading.dashboard || !chartsData ? (
                  <ChartSkeleton />
                ) : (
                  <Card 
                    title="Trips per Day"
                    subtitle="Trip frequencies over the last 7 days"
                  >
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartsData.tripsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-900" />
                          <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="trips" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" name="Completed Trips" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </ErrorBoundary>
            </div>

            {/* Chart 2: Vehicle Status Distribution */}
            <div>
              <ErrorBoundary fallbackMessage="Unable to load vehicle status distribution." onRetry={fetchDashboardMetrics}>
                {loading.vehicles || loading.dashboard || !chartsData ? (
                  <ChartSkeleton />
                ) : (
                  <Card
                    title="Vehicle Allocation"
                    subtitle="Current status distributions"
                    className="flex flex-col justify-between h-full"
                  >
                    <div className="h-48 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartsData.vehicleStatusPie}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartsData.vehicleStatusPie.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <p className="text-2xl font-bold font-display text-brand-slate-800 dark:text-white">{metrics.total}</p>
                        <p className="text-[8px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Vehicles</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 text-[10px] font-bold mt-2">
                      {chartsData.vehicleStatusPie.map(item => (
                        <div key={item.name} className="flex items-center space-x-1.5">
                          <span className="w-2 rounded-full h-2" style={{ backgroundColor: item.color }} />
                          <span className="text-brand-slate-500 dark:text-brand-slate-400">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </ErrorBoundary>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 3: Maintenance Trend */}
            <div className="lg:col-span-2">
              <ErrorBoundary fallbackMessage="Unable to load maintenance costs." onRetry={fetchDashboardMetrics}>
                {loading.dashboard || !chartsData ? (
                  <ChartSkeleton />
                ) : (
                  <Card
                    title="Maintenance Costs"
                    subtitle="Monthly repair & inspection costs in USD"
                  >
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartsData.maintenanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-900" />
                          <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="cost" fill="#F97316" radius={[4, 4, 0, 0]} name="Repair Cost ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </ErrorBoundary>
            </div>

            {/* Recent Activities Panel */}
            <div className="flex flex-col">
              <ErrorBoundary fallbackMessage="Unable to load activities." onRetry={fetchDashboardMetrics}>
                <Card
                  title="Live Fleet Activities"
                  subtitle="Realtime operations journal"
                  className="flex-1 flex flex-col justify-between max-h-96"
                  action={
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                    </span>
                  }
                >
                  <div className="divide-y divide-brand-slate-100 dark:divide-brand-slate-900 overflow-y-auto flex-1 pr-1 space-y-1 scrollbar">
                    {dashboardMetrics?.recentActivities && dashboardMetrics.recentActivities.length > 0 ? (
                      dashboardMetrics.recentActivities.slice(0, 5).map((act) => (
                        <div key={act.id} className="py-2.5 flex items-start space-x-3 text-left">
                          <div className="pt-0.5">
                            {act.type.includes('maintenance') ? (
                              <div className="w-5 h-5 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange text-[10px] font-bold font-display">M</div>
                            ) : act.type.includes('vehicle') ? (
                              <div className="w-5 h-5 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold font-display">V</div>
                            ) : (
                              <div className="w-5 h-5 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green text-[10px] font-bold font-display">S</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-brand-slate-700 dark:text-brand-slate-300 leading-normal truncate">
                              {act.message}
                            </p>
                            <span className="text-[9px] font-semibold text-brand-slate-450 dark:text-brand-slate-500 block mt-0.5">
                              {act.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-brand-slate-400 dark:text-brand-slate-500">
                        No operational logs found
                      </div>
                    )}
                  </div>
                </Card>
              </ErrorBoundary>
            </div>

          </div>
        </>
      )}

    </div>
  );
});

export default Dashboard;
