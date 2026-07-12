import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../common/Modal';

const schema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  source: z.string().min(2, 'Source is required'),
  destination: z.string().min(2, 'Destination is required'),
  cargoWeight: z.coerce.number().positive('Cargo weight must be positive'),
  distance: z.coerce.number().positive('Distance must be positive'),
  revenue: z.coerce.number().min(0, 'Revenue cannot be negative'),
  notes: z.string().optional()
});

const TripModal = ({ isOpen, onClose, vehicles, drivers, onSubmit, defaultValues }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      source: '',
      destination: '',
      cargoWeight: 0,
      distance: 0,
      revenue: 0,
      notes: '',
      ...defaultValues
    }
  });

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === watch('vehicleId'));
  const selectedDriver = drivers.find((driver) => driver.id === watch('driverId'));

  useEffect(() => {
    reset({
      vehicleId: '',
      driverId: '',
      source: '',
      destination: '',
      cargoWeight: 0,
      distance: 0,
      revenue: 0,
      notes: '',
      ...defaultValues
    });
  }, [defaultValues, isOpen, reset]);

  const handleFormSubmit = async (values) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Trip Dispatch" size="xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Vehicle</label>
            <select {...register('vehicleId')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue">
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option value={vehicle.id} key={vehicle.id} className="bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white">
                  {vehicle.registrationNumber} • {vehicle.name}
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="mt-1 text-xs text-brand-red">{errors.vehicleId.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Driver</label>
            <select {...register('driverId')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue">
              <option value="">Select driver</option>
              {drivers.map((driver) => (
                <option value={driver.id} key={driver.id} className="bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white">
                  {driver.name} • {driver.licenseNumber}
                </option>
              ))}
            </select>
            {errors.driverId && <p className="mt-1 text-xs text-brand-red">{errors.driverId.message}</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-50/70 dark:bg-brand-slate-900/40 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate-400 dark:text-brand-slate-500">Vehicle status</p>
              <p className="mt-1 text-sm font-semibold text-brand-slate-850 dark:text-white">{selectedVehicle?.status || 'Awaiting selection'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate-400 dark:text-brand-slate-500">Remaining capacity</p>
              <p className="mt-1 text-sm font-semibold text-brand-slate-850 dark:text-white">{selectedVehicle ? selectedVehicle.capacity - (watch('cargoWeight') || 0) : '—'} kg</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate-400 dark:text-brand-slate-500">Driver safety</p>
              <p className="mt-1 text-sm font-semibold text-brand-slate-850 dark:text-white">{selectedDriver?.safetyScore || '—'} / 100</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate-400 dark:text-brand-slate-500">License</p>
              <p className="mt-1 text-sm font-semibold text-brand-slate-850 dark:text-white">{selectedDriver ? (new Date(selectedDriver.expiryDate) < new Date() ? 'Expired' : 'Valid') : '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Source</label>
            <input {...register('source')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            {errors.source && <p className="mt-1 text-xs text-brand-red">{errors.source.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Destination</label>
            <input {...register('destination')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            {errors.destination && <p className="mt-1 text-xs text-brand-red">{errors.destination.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Cargo Weight (kg)</label>
            <input type="number" {...register('cargoWeight')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            {errors.cargoWeight && <p className="mt-1 text-xs text-brand-red">{errors.cargoWeight.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Distance (km)</label>
            <input type="number" {...register('distance')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            {errors.distance && <p className="mt-1 text-xs text-brand-red">{errors.distance.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Revenue ($)</label>
            <input type="number" {...register('revenue')} className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue" />
            {errors.revenue && <p className="mt-1 text-xs text-brand-red">{errors.revenue.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300">Notes</label>
            <textarea {...register('notes')} rows="3" className="w-full rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 text-brand-slate-800 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-brand-slate-200 dark:border-brand-slate-800 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 px-4 py-2 text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-300 hover:bg-brand-slate-100 dark:hover:bg-brand-slate-800">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
            {isSubmitting ? 'Creating...' : 'Dispatch Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TripModal;
