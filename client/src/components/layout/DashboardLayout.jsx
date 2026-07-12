// DashboardLayout.jsx - Layout container for authenticated pages
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastContainer from '../common/Toast';
import { useFleet } from '../../context/FleetContext';

const DashboardLayout = () => {
  const { fetchDashboardMetrics, fetchVehicles, fetchMaintenance } = useFleet();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('transitops_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Pre-load essential data for the application context
  useEffect(() => {
    fetchDashboardMetrics();
    fetchVehicles();
    fetchMaintenance();
  }, [fetchDashboardMetrics, fetchVehicles, fetchMaintenance]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('transitops_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-slate-50 dark:bg-brand-slate-950 transition-colors duration-300">
      
      {/* 1. App Sidebar (Drawer on mobile, collapsible on desktop) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* 2. Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Scrollable Page Container */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. Global Toasts */}
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
