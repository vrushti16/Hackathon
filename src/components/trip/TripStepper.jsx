import React from 'react';

const steps = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
];

const TripStepper = ({ status }) => {
  const currentIndex = steps.findIndex((step) => step.value === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="rounded-2xl border border-brand-slate-200 bg-white/80 p-4 dark:border-brand-slate-800 dark:bg-brand-slate-900/60">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          const isCancelled = status === 'Cancelled' && step.value === 'Cancelled';
          return (
            <div key={step.value} className="flex-1 text-center">
              <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                isCancelled || isComplete
                  ? 'border-brand-green bg-brand-green text-white'
                  : isActive
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-brand-slate-200 bg-brand-slate-50 text-brand-slate-500'
              }`}>
                {index + 1}
              </div>
              <p className="mt-2 text-xs font-semibold text-brand-slate-600 dark:text-brand-slate-300">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripStepper;
