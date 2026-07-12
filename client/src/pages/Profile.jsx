import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../auth/useAuth';
import { Camera, Mail, Phone, Building, Briefcase, Calendar, Clock, ShieldCheck, Check } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

// UI Components
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { ProfileSkeleton } from '../components/common/Skeleton';

// Validation Schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(2, 'Department is required')
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const Profile = () => {
  const { user } = useAuth();
  const { triggerToast } = useFleet();
  const [loading, setLoading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+1 (555) 000-0000',
      department: user?.department || 'Operations'
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onUpdateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      triggerToast('Profile updated successfully', 'success');
    } catch (err) {
      triggerToast('Failed to update profile', 'danger');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsUpdatingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      triggerToast('Password changed successfully', 'success');
      resetPassword();
    } catch (err) {
      triggerToast('Failed to change password', 'danger');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal information and security settings."
      />

      {/* Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden transition-card">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Profile Picture */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-brand-slate-800 overflow-hidden bg-brand-slate-100 dark:bg-brand-slate-900 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-display font-bold text-brand-slate-300 dark:text-brand-slate-600">
                {user.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-brand-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
              {user.name}
              {user.role === 'Admin' && <ShieldCheck className="w-5 h-5 text-brand-blue" />}
            </h1>
            <p className="text-sm font-medium text-brand-blue">{user.role}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-brand-slate-600 dark:text-brand-slate-400">
            <div className="flex items-center gap-1.5 bg-brand-slate-50 dark:bg-brand-slate-900/50 px-3 py-1.5 rounded-lg border border-brand-slate-200 dark:border-brand-slate-800">
              <Building className="w-4 h-4" />
              <span>{user.department || 'Operations'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-slate-50 dark:bg-brand-slate-900/50 px-3 py-1.5 rounded-lg border border-brand-slate-200 dark:border-brand-slate-800">
              <Calendar className="w-4 h-4" />
              <span>Joined 2023</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-slate-50 dark:bg-brand-slate-900/50 px-3 py-1.5 rounded-lg border border-brand-slate-200 dark:border-brand-slate-800">
              <Clock className="w-4 h-4" />
              <span>Last login: 2 hours ago</span>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6">
          <StatusBadge status="Active" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Profile Form */}
        <Card title="Personal Information" subtitle="Update your contact details">
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
            <div className="space-y-4">
              <Input
                label="Full Name"
                id="name"
                icon={<Briefcase className="w-4 h-4 text-brand-slate-400" />}
                {...registerProfile('name')}
                error={profileErrors.name?.message}
              />
              <Input
                label="Email Address"
                id="email"
                type="email"
                icon={<Mail className="w-4 h-4 text-brand-slate-400" />}
                {...registerProfile('email')}
                error={profileErrors.email?.message}
              />
              <Input
                label="Phone Number"
                id="phone"
                icon={<Phone className="w-4 h-4 text-brand-slate-400" />}
                {...registerProfile('phone')}
                error={profileErrors.phone?.message}
              />
              <Input
                label="Department"
                id="department"
                icon={<Building className="w-4 h-4 text-brand-slate-400" />}
                {...registerProfile('department')}
                error={profileErrors.department?.message}
              />
            </div>
            <div className="pt-4 flex justify-end border-t border-brand-slate-100 dark:border-brand-slate-900">
              <Button type="submit" variant="primary" loading={isUpdatingProfile} icon={Check}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card title="Security Settings" subtitle="Change your password">
          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            <div className="space-y-4">
              <Input
                label="Current Password"
                id="currentPassword"
                type="password"
                {...registerPassword('currentPassword')}
                error={passwordErrors.currentPassword?.message}
              />
              <Input
                label="New Password"
                id="newPassword"
                type="password"
                {...registerPassword('newPassword')}
                error={passwordErrors.newPassword?.message}
              />
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
                error={passwordErrors.confirmPassword?.message}
              />
            </div>
            
            {/* Password requirements hint */}
            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 text-xs text-brand-slate-600 dark:text-brand-slate-400 space-y-1">
              <p className="font-semibold text-brand-slate-800 dark:text-brand-slate-200 mb-2">Password Requirements:</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-brand-green" /> Minimum 8 characters long</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-brand-green" /> At least one uppercase character</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-brand-green" /> At least one special character</p>
            </div>

            <div className="pt-4 flex justify-end border-t border-brand-slate-100 dark:border-brand-slate-900">
              <Button type="submit" variant="primary" loading={isUpdatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
