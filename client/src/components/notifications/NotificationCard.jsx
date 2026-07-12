import React from 'react';
import { 
  Check, 
  MapPin, 
  Wrench, 
  Droplet, 
  Receipt, 
  AlertTriangle, 
  Car, 
  User 
} from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const NotificationCard = ({ notification, onMarkRead, onMarkUnread }) => {
  const { id, title, description, time, isRead, type, category } = notification;

  const getIcon = () => {
    switch (type) {
      case 'trip_assigned':
      case 'trip_completed':
        return <MapPin className="w-5 h-5 text-brand-blue" />;
      case 'vehicle_maintenance':
      case 'maintenance_completed':
        return <Wrench className="w-5 h-5 text-brand-orange" />;
      case 'vehicle_added':
        return <Car className="w-5 h-5 text-brand-green" />;
      case 'fuel_added':
        return <Droplet className="w-5 h-5 text-brand-blue" />;
      case 'expense_added':
        return <Receipt className="w-5 h-5 text-brand-slate-600" />;
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5 text-brand-red" />;
      case 'user_created':
        return <User className="w-5 h-5 text-brand-blue" />;
      default:
        return <Check className="w-5 h-5 text-brand-slate-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'system_alert': return 'bg-brand-red/10';
      case 'vehicle_maintenance': return 'bg-brand-orange/10';
      case 'vehicle_added': return 'bg-brand-green/10';
      default: return 'bg-brand-blue/10';
    }
  };

  return (
    <div 
      className={`group relative flex gap-4 p-4 rounded-xl border transition-card ${
        isRead 
          ? 'bg-white dark:bg-brand-slate-950 border-brand-slate-100 dark:border-brand-slate-800' 
          : 'bg-brand-blue/5 dark:bg-brand-blue/10 border-brand-blue/20 dark:border-brand-blue/30 shadow-sm'
      }`}
    >
      {!isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
      )}
      
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${getBgColor()}`}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-brand-slate-900 dark:text-white truncate pr-4">
            {title}
          </p>
        </div>
        <p className="text-xs text-brand-slate-600 dark:text-brand-slate-300 line-clamp-2 mb-2">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">
            {formatTimeAgo(time)}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              isRead ? onMarkUnread(id) : onMarkRead(id);
            }}
            className="text-[11px] font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            Mark {isRead ? 'unread' : 'read'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders when list updates
export default React.memo(NotificationCard);
