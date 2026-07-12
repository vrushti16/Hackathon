import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflinePage = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-slate-50/95 dark:bg-brand-slate-950/95 backdrop-blur-sm p-4 animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-brand-slate-100 dark:bg-brand-slate-800 rounded-full flex items-center justify-center mx-auto text-brand-slate-500">
            <WifiOff className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-slate-900 dark:text-white mb-2">
              No Internet Connection
            </h2>
            <p className="text-sm text-brand-slate-600 dark:text-brand-slate-400">
              Please check your network and reconnect to continue.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full transition-btn py-2.5 px-4 bg-brand-blue text-white font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default OfflinePage;
