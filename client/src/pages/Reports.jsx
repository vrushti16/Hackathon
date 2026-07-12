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
  DollarSign
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
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { useFleet } from '../context/FleetContext';
import { downloadCsv } from '../utils/formatters';

// UI components
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { ChartSkeleton, KpiCardSkeleton } from '../components/common/Skeleton';

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

  const COLORS = ['#2563EB', '#22C55E', '#F97316', '#A855F7', '#EF4444'];

  if (!loading && vehicles.length === 0) {
    return (
      <EmptyState
        type="reports"
        actionText="Manage Vehicles"
        onActionClick={() => {
          window.location.pathname = '/vehicles';
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title & Action */}
      <PageHeader
        title="Analytics & Reports"
        subtitle="Export detailed spreadsheets and review fleet cost performance."
      >
        <Button
          onClick={handleExportCSV}
          icon={Download}
          variant="primary"
        >
          Export Fleet Data (CSV)
        </Button>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !reportData ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Fuel Efficiency"
              value={reportData.cards.fuelEfficiency}
              icon={Fuel}
              trend={12}
              trendLabel="avg mpg"
            />
            <StatCard
              title="Fleet Utilization"
              value={reportData.cards.fleetUtilization}
              icon={TrendingUp}
              trend={4}
              trendLabel="vs target 80%"
            />
            <StatCard
              title="Avg Vehicle ROI"
              value={reportData.cards.roiScore}
              icon={ShieldCheck}
              trend={8}
              trendLabel="estimated net margin"
            />
            <StatCard
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
            <Card
              title="Trips Count per Vehicle"
              subtitle="Asset operational frequencies"
              action={<LineIcon className="w-4 h-4 text-brand-blue" />}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.vehicleUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-900" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="trips" stroke="#2563EB" strokeWidth={2} activeDot={{ r: 6 }} name="Trips Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>

        {/* Chart 2: Fuel Efficiency Bar Chart */}
        <div>
          {loading || !reportData ? (
            <ChartSkeleton />
          ) : (
            <Card
              title="Fuel Efficiency comparisons"
              subtitle="MPG / MPGe performance"
              action={<BarChart3 className="w-4 h-4 text-brand-green" />}
            >
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
            </Card>
          )}
        </div>

        {/* Chart 3: Cost Breakdowns Pie Chart */}
        <div className="lg:col-span-2">
          {loading || !reportData ? (
            <ChartSkeleton height="h-80" />
          ) : (
            <Card
              title="Operating Cost Breakdown"
              subtitle="Distribution of operational spending"
              action={<PieIcon className="w-4 h-4 text-brand-orange" />}
            >
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

                <div className="space-y-3 w-full sm:max-w-xs">
                  {reportData.costBreakdown.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-[11px] font-semibold text-brand-slate-700 dark:text-brand-slate-350">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-slate-900 dark:text-white font-mono">
                        ₹{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
};

export default Reports;
