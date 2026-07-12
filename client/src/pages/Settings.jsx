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
  RefreshCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import { useTheme } from '../context/ThemeContext';
import { initDb } from '../services/mockDb';

// UI components
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.string().min(1, 'Role is required')
});

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { triggerToast } = useFleet();
  const [submitting, setSubmitting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || ''
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
    localStorage.removeItem('transitops_vehicles');
    localStorage.removeItem('transitops_maintenance');
    localStorage.removeItem('transitops_activities');
    initDb();
    triggerToast('Fleet database re-seeded', 'success');
    setTimeout(() => {
      window.location.pathname = '/dashboard';
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <PageHeader 
        title="System Preferences" 
        subtitle="Customize dashboard layouts, manage profiles, and control database states."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Section */}
        <div className="lg:col-span-2">
          <Card 
            title="Administrator Profile" 
            icon={User}
          >
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Full name */}
                <Input
                  label="Full Name"
                  id="name"
                  {...register('name')}
                  error={errors.name?.message}
                  className="col-span-2 sm:col-span-1"
                />

                {/* Email */}
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  {...register('email')}
                  error={errors.email?.message}
                  className="col-span-2 sm:col-span-1"
                />

                {/* Role */}
                <Input
                  label="Role Designation"
                  id="role"
                  {...register('role')}
                  error={errors.role?.message}
                  className="col-span-2 sm:col-span-1"
                />

              </div>

              <div className="flex items-center justify-end pt-3">
                <Button
                  type="submit"
                  loading={submitting}
                  icon={Save}
                  variant="primary"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Configurations column */}
        <div className="space-y-6">
          
          {/* Appearance Preference Card */}
          <Card
            title="Appearance Preferences"
            icon={SettingsIcon}
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
              <div className="text-xs">
                <p className="font-semibold text-brand-slate-700 dark:text-white">Active Theme</p>
                <p className="text-[10px] text-brand-slate-450 mt-0.5">Toggle between dark and light colors</p>
              </div>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                icon={theme === 'dark' ? Moon : Sun}
                className="font-bold border-brand-slate-200 dark:border-brand-slate-800 text-brand-slate-700 dark:text-brand-slate-350"
              >
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Button>
            </div>
          </Card>

          {/* Database Control Card */}
          <Card
            title="Database Control Panel"
            icon={Database}
          >
            <p className="text-xs text-brand-slate-500 leading-normal mb-4">
              Reset fleet database records back to their factory seeds. Useful for resolving mock database testing states.
            </p>
            <Button
              onClick={() => setIsResetConfirmOpen(true)}
              variant="secondary"
              fullWidth
              icon={RefreshCcw}
              className="text-white bg-brand-orange hover:bg-brand-orange/95 border-none"
            >
              Reset Database to Seed
            </Button>
          </Card>

        </div>

      </div>

      {/* Database Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDb}
        title="Reset Database?"
        message="This will wipe all current updates and restore mock seed values. This action cannot be undone."
        confirmText="Reset Database"
        isDanger={true}
      />
    </div>
  );
};

export default Settings;
