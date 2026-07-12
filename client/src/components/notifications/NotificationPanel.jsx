import React from 'react';
import { X, CheckCheck, Search, Filter } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCard from './NotificationCard';
import NotificationEmpty from './NotificationEmpty';
import NotificationSkeleton from './NotificationSkeleton';
import Drawer from '../common/Drawer';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    loading, 
    filter, 
    setFilter, 
    search, 
    setSearch, 
    markAsRead, 
    markAsUnread, 
    markAllAsRead 
  } = useNotifications();

  const categories = ['All', 'Unread', 'Trips', 'Vehicles', 'Maintenance', 'System'];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="right" size="md">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-slate-200 dark:border-brand-slate-800 flex items-center justify-between bg-white dark:bg-brand-slate-950 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold font-display text-brand-slate-900 dark:text-white">
              Notifications
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="p-2 text-brand-slate-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-btn"
              title="Mark all as read"
            >
              <CheckCheck className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brand-slate-500 hover:bg-brand-slate-100 dark:hover:bg-brand-slate-900 rounded-lg transition-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="px-6 py-4 border-b border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-50 dark:bg-brand-slate-950/50 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-brand-slate-900 border border-brand-slate-200 dark:border-brand-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/40 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-brand-slate-400 flex-shrink-0 mr-1" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-btn ${
                  filter === cat 
                    ? 'bg-brand-blue text-white shadow-sm' 
                    : 'bg-white dark:bg-brand-slate-900 text-brand-slate-600 dark:text-brand-slate-300 border border-brand-slate-200 dark:border-brand-slate-800 hover:border-brand-blue/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-slate-50 dark:bg-brand-slate-950">
          {loading ? (
            <NotificationSkeleton />
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                onMarkRead={markAsRead}
                onMarkUnread={markAsUnread}
              />
            ))
          ) : (
            <NotificationEmpty />
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default NotificationPanel;
