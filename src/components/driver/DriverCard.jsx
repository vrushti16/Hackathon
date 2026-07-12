import React from 'react';
import { ShieldCheck, Phone, CalendarClock, BadgeCheck } from 'lucide-react';

const DriverCard = ({ driver, onView, onEdit, onDelete }) => {
  const getLicenseTone = () => {
    const today = new Date();
    const expiry = new Date(driver.expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-brand-red';
    if (diffDays <= 30) return 'text-brand-orange';
    return 'text-brand-green';
  };

  return (
    <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/70 dark:bg-brand-slate-900/60 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-slate-900 dark:text-white">{driver.name}</p>
          <p className="text-sm text-brand-slate-500">{driver.category}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
          <BadgeCheck className="mr-1 h-3.5 w-3.5" /> {driver.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-brand-slate-600 dark:text-brand-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`h-4 w-4 ${getLicenseTone()}`} />
          <span>{driver.licenseNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          <span>Expires {new Date(driver.expiryDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{driver.contact}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => onView(driver)}
          type="button"
          className="flex-1 rounded-xl border border-brand-slate-200 px-3 py-2 text-sm font-semibold text-brand-slate-700 hover:bg-brand-slate-50"
        >
          View
        </button>
        <button
          onClick={() => onEdit(driver)}
          type="button"
          className="flex-1 rounded-xl bg-brand-blue px-3 py-2 text-sm font-semibold text-white"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(driver.id)}
          type="button"
          className="flex-1 rounded-xl bg-brand-red/10 px-3 py-2 text-sm font-semibold text-brand-red"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DriverCard;
