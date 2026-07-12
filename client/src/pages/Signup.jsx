import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Truck, Mail, Lock, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import ThemeToggle from '../components/common/ThemeToggle';
import Loader from '../components/common/Loader';

// Form validation schema with Zod
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
  role: z.enum(['Admin', 'FleetManager', 'Driver'], { required_error: 'Role is required' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

const Signup = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const { triggerToast } = useFleet();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if user is already authenticated
  const from = location.state?.from?.pathname || '/dashboard';
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'FleetManager'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage('');
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      triggerToast('Registration successful! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
      triggerToast(err.message || 'Registration failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-brand-slate-50 dark:bg-brand-slate-950 transition-colors duration-300 relative">
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="w-full max-w-md bg-white dark:bg-brand-slate-900 border border-brand-slate-200 dark:border-brand-slate-800 p-8 rounded-2xl shadow-lg space-y-6 animate-scale-in">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/30">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
              Create an Account
            </h2>
            <p className="text-xs text-brand-slate-500 dark:text-brand-slate-450 max-w-xs leading-relaxed">
              Sign up to start using TransitOps.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Error Alert Box */}
          {errorMessage && (
            <div className="flex items-center space-x-2.5 p-3 rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red animate-fade-in">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                disabled={loading}
                {...register('name')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-brand-slate-900/50 text-sm text-brand-slate-800 dark:text-white placeholder-brand-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all ${
                  errors.name ? 'border-brand-red focus:border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800 focus:border-brand-blue'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] font-bold text-brand-red animate-fade-in">{errors.name.message}</p>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="user@transitops.com"
                disabled={loading}
                {...register('email')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-brand-slate-900/50 text-sm text-brand-slate-800 dark:text-white placeholder-brand-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all ${
                  errors.email ? 'border-brand-red focus:border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800 focus:border-brand-blue'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] font-bold text-brand-red animate-fade-in">{errors.email.message}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="role">
              Role
            </label>
            <div className="relative">
              <select
                id="role"
                disabled={loading}
                {...register('role')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-brand-slate-900/50 text-sm text-brand-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none ${
                  errors.role ? 'border-brand-red focus:border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800 focus:border-brand-blue'
                }`}
              >
                <option value="Admin">Admin</option>
                <option value="FleetManager">Fleet Manager</option>
                <option value="Driver">Driver</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-[11px] font-bold text-brand-red animate-fade-in">{errors.role.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-brand-slate-900/50 text-sm text-brand-slate-800 dark:text-white placeholder-brand-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all ${
                    errors.password ? 'border-brand-red focus:border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800 focus:border-brand-blue'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] font-bold text-brand-red animate-fade-in">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="confirmPassword">
                Confirm
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-brand-slate-900/50 text-sm text-brand-slate-800 dark:text-white placeholder-brand-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all ${
                    errors.confirmPassword ? 'border-brand-red focus:border-brand-red' : 'border-brand-slate-200 dark:border-brand-slate-800 focus:border-brand-blue'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-bold text-brand-red animate-fade-in">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-50 transition-all duration-200 shadow-sm shadow-brand-blue/20 cursor-pointer hover:shadow-md hover:scale-[1.01]"
            >
              {loading ? (
                <Loader size="sm" className="text-white" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-2 text-center">
          <p className="text-xs font-semibold text-brand-slate-500 dark:text-brand-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-[10px] text-brand-slate-400 dark:text-brand-slate-500">
        &copy; {new Date().getFullYear()} TransitOps Logistics. Production-Grade Transport Management System.
      </footer>
    </div>
  );
};

export default Signup;
