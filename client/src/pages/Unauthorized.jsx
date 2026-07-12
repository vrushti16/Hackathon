// Unauthorized.jsx - Professional 403 Access Denied Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-brand-slate-50 dark:bg-brand-slate-950 transition-colors duration-300 relative">
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="w-full max-w-md bg-white dark:bg-brand-slate-900 border border-brand-slate-200 dark:border-brand-slate-800 p-8 rounded-2xl shadow-lg space-y-8 animate-scale-in text-center">
        
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex items-center justify-center text-brand-red shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
            Access Denied
          </h1>
          <p className="text-sm text-brand-slate-500 dark:text-brand-slate-400 leading-relaxed">
            You do not have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-brand-slate-700 dark:text-brand-slate-200 bg-brand-slate-100 dark:bg-brand-slate-800 hover:bg-brand-slate-200 dark:hover:bg-brand-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover transition-all duration-200 shadow-sm shadow-brand-blue/20 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Unauthorized;
