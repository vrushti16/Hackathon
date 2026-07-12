import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-brand-slate-500 hover:text-brand-slate-900 dark:text-brand-slate-400 dark:hover:text-white transition-btn rounded-xl hover:bg-brand-slate-100 dark:hover:bg-brand-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      <NotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationBell;
