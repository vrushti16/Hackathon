import React from 'react';
import { Bell } from 'lucide-react';

const NotificationEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-brand-slate-500 dark:text-brand-slate-400 animate-fade-in">
      <div className="p-4 mb-4 rounded-full bg-brand-slate-100 dark:bg-brand-slate-800">
        <Bell className="w-8 h-8 opacity-50" />
      </div>
      <h3 className="text-lg font-semibold text-brand-slate-900 dark:text-white mb-2">
        No Notifications Yet
      </h3>
      <p className="text-sm">
        When you get notifications, they'll show up here.
      </p>
    </div>
  );
};

export default NotificationEmpty;
