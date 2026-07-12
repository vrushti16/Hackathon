import React from 'react';

const Toggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
      <div className="text-xs">
        <p className="font-semibold text-brand-slate-700 dark:text-white">{label}</p>
        {description && (
          <p className="text-[10px] text-brand-slate-450 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-brand-slate-950 ${
          checked ? 'bg-brand-blue' : 'bg-brand-slate-200 dark:bg-brand-slate-700'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-2' : '-translate-x-2'
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
