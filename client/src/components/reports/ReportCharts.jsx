import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import Card from '../ui/Card';
import { ChartSkeleton } from '../common/Skeleton';

const COLORS = ['#2563EB', '#22C55E', '#F97316', '#A855F7', '#EF4444', '#14B8A6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-brand-slate-900/90 dark:bg-black/90 text-white rounded-lg border border-brand-slate-800 text-[10px] shadow-lg backdrop-blur-md">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ color: p.color || p.fill || '#2563EB' }} className="font-medium">
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const LineReportChart = ({ title, subtitle, data, dataKey, lines, isLoading, height = "h-72", icon: Icon }) => {
  if (isLoading) return <ChartSkeleton height={height} />;
  return (
    <Card title={title} subtitle={subtitle} action={Icon && <Icon className="w-4 h-4 text-brand-slate-400" />}>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-800" />
            <XAxis dataKey={dataKey} stroke="#64748B" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {lines.map((line, i) => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color || COLORS[i % COLORS.length]} strokeWidth={2} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const BarReportChart = ({ title, subtitle, data, dataKey, bars, stacked = false, isLoading, height = "h-72", icon: Icon }) => {
  if (isLoading) return <ChartSkeleton height={height} />;
  return (
    <Card title={title} subtitle={subtitle} action={Icon && <Icon className="w-4 h-4 text-brand-slate-400" />}>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-800" />
            <XAxis dataKey={dataKey} stroke="#64748B" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {bars.map((bar, i) => (
              <Bar key={bar.key} dataKey={bar.key} name={bar.name} stackId={stacked ? "a" : undefined} fill={bar.color || COLORS[i % COLORS.length]} radius={stacked ? [0,0,0,0] : [4,4,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const AreaReportChart = ({ title, subtitle, data, dataKey, areas, isLoading, height = "h-72", icon: Icon }) => {
  if (isLoading) return <ChartSkeleton height={height} />;
  return (
    <Card title={title} subtitle={subtitle} action={Icon && <Icon className="w-4 h-4 text-brand-slate-400" />}>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-slate-800" />
            <XAxis dataKey={dataKey} stroke="#64748B" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {areas.map((area, i) => (
              <Area key={area.key} type="monotone" dataKey={area.key} name={area.name} stroke={area.color || COLORS[i % COLORS.length]} fill={area.color || COLORS[i % COLORS.length]} fillOpacity={0.3} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const PieReportChart = ({ title, subtitle, data, dataKey, nameKey, donut = false, isLoading, height = "h-72", icon: Icon }) => {
  if (isLoading) return <ChartSkeleton height={height} />;
  
  const total = data.reduce((sum, item) => sum + item[dataKey], 0);

  return (
    <Card title={title} subtitle={subtitle} action={Icon && <Icon className="w-4 h-4 text-brand-slate-400" />}>
      <div className={`flex flex-col sm:flex-row items-center justify-around gap-6 ${height}`}>
        <div className="h-full w-full max-w-[250px] relative flex items-center justify-center flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={donut ? 60 : 0}
                outerRadius={80}
                paddingAngle={donut ? 5 : 0}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {donut && (
            <div className="absolute text-center pointer-events-none">
              <p className="text-xl font-bold font-display text-brand-slate-800 dark:text-white">
                {total > 1000 ? `${(total/1000).toFixed(1)}k` : total}
              </p>
              <p className="text-[9px] font-bold text-brand-slate-400 uppercase tracking-wider">Total</p>
            </div>
          )}
        </div>
        <div className="space-y-2 w-full sm:w-auto flex-1">
          {data.map((item, idx) => (
            <div key={item[nameKey]} className="flex items-center justify-between p-2 rounded-lg bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-semibold text-brand-slate-700 dark:text-brand-slate-350">{item[nameKey]}</span>
              </div>
              <span className="text-xs font-bold text-brand-slate-900 dark:text-white font-mono">
                {item[dataKey].toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
