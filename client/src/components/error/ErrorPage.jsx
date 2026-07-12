import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = ({ type = '404' }) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (type) {
      case '403':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
          icon: <AlertTriangle className="w-12 h-12 text-brand-orange" />
        };
      case '500':
        return {
          title: 'Server Error',
          message: 'Oops! Something went wrong on our end. Please try again later.',
          icon: <AlertTriangle className="w-12 h-12 text-brand-red" />
        };
      case '404':
      default:
        return {
          title: 'Page Not Found',
          message: "The page you're looking for doesn't exist or has been moved.",
          icon: <span className="text-5xl font-bold text-brand-slate-300 dark:text-brand-slate-600">404</span>
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-slate-50 dark:bg-brand-slate-950 p-4 animate-fade-in">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-brand-slate-100 dark:bg-brand-slate-800/50 rounded-full flex items-center justify-center mx-auto shadow-inner">
          {content.icon}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-brand-slate-900 dark:text-white mb-2 font-display">
            {content.title}
          </h1>
          <p className="text-sm text-brand-slate-600 dark:text-brand-slate-400">
            {content.message}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex justify-center items-center gap-2 transition-btn py-2.5 px-4 bg-white dark:bg-brand-slate-900 text-brand-slate-700 dark:text-white font-semibold rounded-xl border border-brand-slate-200 dark:border-brand-slate-700 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 inline-flex justify-center items-center gap-2 transition-btn py-2.5 px-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue-hover"
          >
            <Home className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
