import React from 'react';
import { ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const roleRedirects = {
      Admin: '/dashboard',
      'Fleet Manager': '/dashboard',
      Driver: '/dashboard',
      'Safety Officer': '/dashboard',
      'Financial Analyst': '/dashboard'
    };
    navigate(roleRedirects[user.role] || '/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-brand-slate-50 dark:bg-brand-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-brand-slate-900 border border-brand-slate-200 dark:border-brand-slate-800 p-8 rounded-2xl shadow-lg text-center space-y-6 animate-scale-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
            Access Denied
          </h1>
          <p className="text-sm text-brand-slate-550 dark:text-brand-slate-400">
            You do not have permission to view this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGoDashboard}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-md shadow-brand-blue/15 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 text-brand-slate-700 dark:text-brand-slate-350 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-850 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
