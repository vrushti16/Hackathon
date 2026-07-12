// EmptyState.jsx - Reusable placeholder for empty data states
import React from 'react';
import { 
  ArchiveRestore, 
  Truck, 
  MapPin, 
  Users, 
  BarChart3, 
  Receipt 
} from 'lucide-react';
import Button from './Button';

const defaultTypes = {
  vehicles: {
    icon: Truck,
    title: 'No Vehicles Registered',
    description: 'Start by registering your first vehicle fleet asset to manage tracking and schedules.'
  },
  trips: {
    icon: MapPin,
    title: 'No Trips Scheduled',
    description: 'Create draft trips or dispatch active routes to monitor transport deliveries.'
  },
  drivers: {
    icon: Users,
    title: 'No Drivers Profiled',
    description: 'Register driver profiles, license details, and monitor safety logs.'
  },
  reports: {
    icon: BarChart3,
    title: 'No Analytics Data',
    description: 'Execute ROI calculator or update date range filters to generate charts.'
  },
  expenses: {
    icon: Receipt,
    title: 'No Expenses Logged',
    description: 'Record fuel logs, toll fees, and maintenance costs to track operational expenditures.'
  }
};

const EmptyState = ({
  type = null, // vehicles, trips, drivers, reports, expenses
  icon: CustomIcon = null,
  title = 'No results found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  actionText,
  onActionClick,
  className = ''
}) => {
  const selectedConfig = type && defaultTypes[type] ? defaultTypes[type] : null;
  const Icon = CustomIcon || (selectedConfig ? selectedConfig.icon : ArchiveRestore);
  const displayTitle = selectedConfig ? selectedConfig.title : title;
  const displayDesc = selectedConfig ? selectedConfig.description : description;

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel max-w-lg mx-auto my-8 animate-fade-in ${className}`}>
      <div className="p-4 bg-brand-slate-100 dark:bg-brand-slate-900 rounded-2xl text-brand-slate-400 dark:text-brand-slate-500 mb-5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display mb-2">
        {displayTitle}
      </h3>
      <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400 max-w-sm mb-6 leading-relaxed">
        {displayDesc}
      </p>
      {actionText && onActionClick && (
        <Button
          onClick={onActionClick}
          variant="primary"
          size="md"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
