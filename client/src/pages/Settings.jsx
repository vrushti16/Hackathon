// Settings.jsx - Application preferences and mock database controls
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Settings as SettingsIcon, 
  Database, 
  Moon, 
  Sun, 
  Save, 
  RefreshCcw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import { useTheme } from '../context/ThemeContext';
import { initDb } from '../services/mockDb';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  avatar: z.string().url('Invalid image URL').or(z.string().length(0))
});

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { triggerToast } = useFleet();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      avatar: user?.avatar || ''
    }
  });

  const onSubmitProfile = async (data) => {
    setSubmitting(true);
    try {
      // Simulate profile update saving to storage
      const updatedUser = { ...user, ...data };
      localStorage.setItem('transitops_user', JSON.stringify(updatedUser));
      
      // Update database list also
      const users = JSON.parse(localStorage.getItem('transitops_users') || '[]');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        localStorage.setItem('transitops_users', JSON.stringify(users));
      }

      triggerToast('Profile settings saved successfully', 'success');
      
      // Refresh page in 1s to reload auth session values
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      triggerToast('Failed to save profile details', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDb = () => {
    if (window.confirm('Reset database to default mock values? This will wipe all current updates.')) {
      localStorage.removeItem('transitops_vehicles');
      localStorage.removeItem('transitops_maintenance');
      localStorage.removeItem('transitops_activities');
      initDb();
      triggerToast('Fleet database re-seeded', 'success');
      setTimeout(() => {
        window.location.pathname = '/dashboard';
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
          System Preferences
        </h2>
        <p className="text-xs text-brand-slate-500 dark:text-brand-slate-400">
          Customize dashboard layouts, manage profiles, and control database states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="glass-panel p-6 rounded-xl space-y-5">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-blue" />
              <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Administrator Profile</h4>
            </div>

            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Full Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                      errors.name ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-brand-red font-semibold">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                      errors.email ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-brand-red font-semibold">{errors.email.message}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Role Designation</label>
                  <input
                    type="text"
                    {...register('role')}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                      errors.role ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                    }`}
                  />
                  {errors.role && (
                    <p className="text-[10px] text-brand-red font-semibold">{errors.role.message}</p>
                  )}
                </div>

                {/* Avatar URL */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400">Avatar Image URL</label>
                  <input
                    type="text"
                    {...register('avatar')}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-transparent text-brand-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                      errors.avatar ? 'border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800'
                    }`}
                  />
                  {errors.avatar && (
                    <p className="text-[10px] text-brand-red font-semibold">{errors.avatar.message}</p>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Configurations column */}
        <div className="space-y-6">
          
          {/* Theme Settings Card */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4 text-brand-blue" />
              <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Appearance Preferences</h4>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
              <div className="text-xs">
                <p className="font-semibold text-brand-slate-700 dark:text-white">Active Theme</p>
                <p className="text-[10px] text-brand-slate-450 mt-0.5">Toggle between dark and light colors</p>
              </div>
              <button
                onClick={toggleTheme}
                type="button"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 text-xs font-bold bg-white dark:bg-brand-slate-950 text-brand-slate-700 dark:text-brand-slate-350 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Database Control Settings Card */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-brand-orange" />
              <h4 className="text-sm font-bold text-brand-slate-800 dark:text-white font-display">Database Control Panel</h4>
            </div>
            
            <p className="text-xs text-brand-slate-500 leading-normal">
              Reset fleet database records back to their factory seeds. Useful for resolving mock database testing states.
            </p>

            <button
              onClick={handleResetDb}
              type="button"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange/95 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset Database to Seed</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
