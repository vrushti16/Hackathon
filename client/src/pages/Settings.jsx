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
  Building,
  Bell,
  Shield,
  Globe,
  Clock,
  LogOut,
  Smartphone
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
import Toggle from '../components/ui/Toggle';
import Select from '../components/ui/Select';

const companySchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  contactEmail: z.string().email('Invalid email address'),
  supportPhone: z.string().min(1, 'Phone is required')
});

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { triggerToast } = useFleet();
  const [submitting, setSubmitting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Preferences State
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReport: true,
    profileVisibility: 'public',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    twoFactor: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: 'TransitOps Logistics',
      contactEmail: 'support@transitops.com',
      supportPhone: '+1 (800) 555-0199'
    }
  });

  const onSubmitCompanyInfo = async (data) => {
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      triggerToast('Company settings saved successfully', 'success');
    } catch (err) {
      triggerToast('Failed to save company details', 'danger');
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

  const updatePref = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    triggerToast('Preference updated', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Title */}
      <PageHeader 
        title="System Preferences" 
        subtitle="Manage company information, localizations, security, and database states."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Information Card */}
          <Card title="Company Information" icon={Building}>
            <form onSubmit={handleSubmit(onSubmitCompanyInfo)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  id="companyName"
                  {...register('companyName')}
                  error={errors.companyName?.message}
                  className="col-span-2"
                />
                <Input
                  label="Support Email"
                  type="email"
                  id="contactEmail"
                  {...register('contactEmail')}
                  error={errors.contactEmail?.message}
                  className="col-span-2 sm:col-span-1"
                />
                <Input
                  label="Support Phone"
                  id="supportPhone"
                  {...register('supportPhone')}
                  error={errors.supportPhone?.message}
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
                  Save Information
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Access */}
          <Card title="Security Settings" icon={Shield}>
            <div className="space-y-4">
              <Toggle
                label="Two-Factor Authentication (2FA)"
                description="Require a security code when logging in"
                checked={prefs.twoFactor}
                onChange={(v) => updatePref('twoFactor', v)}
              />
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
                <div className="text-xs">
                  <p className="font-semibold text-brand-slate-700 dark:text-white">Profile Visibility</p>
                  <p className="text-[10px] text-brand-slate-450 mt-0.5">Control who can see your profile details</p>
                </div>
                <select
                  value={prefs.profileVisibility}
                  onChange={(e) => updatePref('profileVisibility', e.target.value)}
                  className="text-xs rounded-lg border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 px-3 py-1.5 focus:outline-none"
                >
                  <option value="public">Public (Entire Organization)</option>
                  <option value="private">Private (Admins Only)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Session Info */}
          <Card title="Session Information" icon={Smartphone}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-slate-50/50 dark:bg-brand-slate-900/20 border border-brand-slate-100 dark:border-brand-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-slate-800 dark:text-white">Current Session</p>
                    <p className="text-[10px] text-brand-slate-500">Windows 11 • Chrome 114 • New York, US</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-brand-green/10 text-brand-green text-[10px] font-bold rounded uppercase">Active</div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" icon={LogOut} className="text-brand-red border-brand-red/20 hover:bg-brand-red/5">
                  Sign Out All Other Sessions
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Preferences */}
        <div className="space-y-6">
          
          {/* Regional Settings */}
          <Card title="Regional Settings" icon={Globe}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Language</label>
                <select
                  value={prefs.language}
                  onChange={(e) => updatePref('language', e.target.value)}
                  className="w-full text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 px-3 py-2.5 focus:outline-none focus:border-brand-blue"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Timezone</label>
                <select
                  value={prefs.timezone}
                  onChange={(e) => updatePref('timezone', e.target.value)}
                  className="w-full text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 px-3 py-2.5 focus:outline-none focus:border-brand-blue"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-slate-400 dark:text-brand-slate-500 uppercase tracking-wider">Currency</label>
                <select
                  value={prefs.currency}
                  onChange={(e) => updatePref('currency', e.target.value)}
                  className="w-full text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-900 px-3 py-2.5 focus:outline-none focus:border-brand-blue"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notification Preferences" icon={Bell}>
            <div className="space-y-3">
              <Toggle
                label="Email Alerts"
                description="Receive alerts for critical fleet events"
                checked={prefs.emailAlerts}
                onChange={(v) => updatePref('emailAlerts', v)}
              />
              <Toggle
                label="Push Notifications"
                description="Browser notifications for real-time updates"
                checked={prefs.pushNotifications}
                onChange={(v) => updatePref('pushNotifications', v)}
              />
              <Toggle
                label="Weekly Report"
                description="Receive a summary report every Monday"
                checked={prefs.weeklyReport}
                onChange={(v) => updatePref('weeklyReport', v)}
              />
            </div>
          </Card>

          {/* Appearance Preference Card */}
          <Card title="Appearance Preferences" icon={SettingsIcon}>
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
          <Card title="Database Control Panel" icon={Database}>
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
