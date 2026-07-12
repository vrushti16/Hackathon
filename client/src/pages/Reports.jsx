// Reports.jsx - Management Analytics & CSV Reporting exports
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  BarChart3, 
  Fuel, 
  TrendingUp, 
  PieChart as PieIcon, 
  LineChart as LineIcon,
  ShieldCheck,
  DollarSign,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { useFleet } from '../context/FleetContext';
import KpiCard from '../components/common/KpiCard';
import { ChartSkeleton, KpiCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { downloadCsv } from '../utils/formatters';

const Reports = () => {
  const { vehicles, triggerToast } = useFleet();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/metrics');
      setReportData(response.data);
    } catch (err) {
      triggerToast(err.message || 'Failed to fetch report data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [vehicles]); // Re-fetch reports if fleet records changes

  const handleExportCSV = () => {
    if (vehicles.length === 0) {
      triggerToast('No vehicles available to export', 'warning');
      return;
    }

    const headers = [
      'registrationNumber',
      'name',
      'type',
      'capacity',
      'odometer',
      'acquisitionCost',
      'status',
      'region',
      'fuelEfficiency',
      'tripsCount',
      'operationalCost'
    ];

    downloadCsv(headers, vehicles, `TransitOps_Fleet_Report_${new Date().toISOString().split('T')[0]}.csv`);
    triggerToast('Fleet report exported to CSV', 'success');
  };

  // Recharts Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-brand-slate-900/90 dark:bg-black/90 text-white rounded-lg border border-brand-slate-800 text-xs shadow-lg backdrop-blur-md">
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

  const COLORS = ['#2563EB', '#22C55E', '#F97316', '#A855F7', '#EF4444'];

  if (!loading && vehicles.length === 0) {
    return (
      <EmptyState
        title="No vehicles in inventory"
        description="Please add vehicles in the Vehicles page first to generate analytical reports."
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
            Analytics & Reports
          </h2>
          <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
            Export detailed spreadsheets and review fleet cost performance.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          type="button"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Fleet Data (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !reportData ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              title="Fuel Efficiency"
              value={reportData.cards.fuelEfficiency}
              icon={Fuel}
              trend={12}
              trendLabel="avg mpg"
            />
            <KpiCard
              title="Fleet Utilization"
              value={reportData.cards.fleetUtilization}
              icon={TrendingUp}
              trend={4}
              trendLabel="vs target 80%"
            />
            <KpiCard
              title="Avg Vehicle ROI"
              value={reportData.cards.roiScore}
              icon={ShieldCheck}
              trend={8}
              trendLabel="estimated net margin"
            />
            <KpiCard
              title="Total Operating Cost"
              value={reportData.cards.operationalCost}
              icon={DollarSign}
              isCost={true}
              trend={-2}
              trendLabel="vs last month"
            />
          </>
        )}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Odometer & Usage Line Chart */}
        <div>
          {loading || !reportData ? (
            <ChartSkeleton />
          ) : (
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Trips Count per Vehicle</h4>
                  <p className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500">Asset operational frequencies</p>
                </div>
                <LineIcon className="w-4 h-4 text-brand-blue" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.vehicleUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-900" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="trips" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} name="Trips Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Fuel Efficiency Bar Chart */}
        <div>
          {loading || !reportData ? (
            <ChartSkeleton />
          ) : (
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Fuel Efficiency comparisons</h4>
                  <p className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500">MPG / MPGe performance</p>
                </div>
                <BarChart3 className="w-4 h-4 text-brand-green" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.fuelEfficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-900" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="efficiency" fill="#22C55E" radius={[4, 4, 0, 0]} name="Efficiency (MPG)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Chart 3: Cost Breakdowns Pie Chart */}
        <div className="lg:col-span-2">
          {loading || !reportData ? (
            <ChartSkeleton height="h-80" />
          ) : (
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Operating Cost Breakdown</h4>
                  <p className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500">Distribution of operational spending</p>
                </div>
                <PieIcon className="w-4 h-4 text-brand-orange" />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
                <div className="h-64 w-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData.costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold font-display text-brand-slate-800 dark:text-white">
                      ₹{reportData.costBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Total Spent</p>
                  </div>
                </div>

                <div className="space-y-3.5 w-full sm:max-w-xs">
                  {reportData.costBreakdown.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-xs font-semibold text-brand-slate-700 dark:text-brand-slate-300">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-slate-900 dark:text-white">
                        ₹{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Reports;
