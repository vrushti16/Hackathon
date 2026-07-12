import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBadge = ({ count }) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-brand-slate-950 animate-scale-in">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
