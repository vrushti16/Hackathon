// Navbar.jsx - App header bar with search and settings triggers
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { dashboardMetrics } = useFleet();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const activities = dashboardMetrics?.recentActivities || [];
  const unreadCount = Math.min(activities.length, 3); // Mock unread count

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-white/70 dark:bg-brand-slate-950/70 backdrop-blur-md border-b border-brand-slate-200 dark:border-brand-slate-900 transition-all duration-300">
      
      {/* Left side: Hamburger (Mobile) & Quick title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSidebar}
          type="button"
          className="p-2 -ml-2 rounded-xl text-brand-slate-500 dark:text-brand-slate-400 hover:text-brand-slate-800 dark:hover:text-white hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 md:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        
        {/* Quick Title */}
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-brand-slate-800 dark:text-white font-display tracking-tight">
            Fleet Operations
          </h1>
          <p className="text-[10px] font-semibold text-brand-slate-400 dark:text-brand-slate-500">
            TransitOps Fleet Control Panel
          </p>
        </div>
      </div>

      {/* Right side: Search, Theme, Notify, Profile */}
      <div className="flex items-center space-x-3.5">
        
        {/* Mock Search (Visual only in Navbar) */}
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Global search..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-brand-slate-50/50 dark:bg-brand-slate-900/30 text-brand-slate-700 placeholder-brand-slate-400 dark:text-brand-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/25 transition-all duration-200"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Panel */}
        <NotificationBell />

        {/* User Profile Dropper */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            type="button"
            className="flex items-center space-x-2 p-1.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 transition-all duration-200 cursor-pointer"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-bold text-brand-slate-700 dark:text-brand-slate-300 pr-1 truncate max-w-28 font-display">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-52 glass-modal border border-brand-slate-200 dark:border-brand-slate-800 rounded-xl shadow-xl overflow-hidden py-1.5 animate-scale-in z-40">
              <div className="px-4 py-2 border-b border-brand-slate-100 dark:border-brand-slate-900 mb-1">
                <p className="text-xs font-bold text-brand-slate-800 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-brand-slate-400 dark:text-brand-slate-500 truncate">{user?.email}</p>
              </div>
              <a 
                href="/settings"
                onClick={(e) => {
                  e.preventDefault();
                  setProfileOpen(false);
                  window.location.pathname = '/settings';
                }}
                className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-brand-slate-600 dark:text-brand-slate-400 hover:text-brand-slate-800 dark:hover:text-white hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 transition-colors"
              >
                <Settings className="w-4 h-4 text-brand-slate-400" />
                <span>Account Settings</span>
              </a>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                type="button"
                className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-brand-red hover:bg-brand-red/5 w-full text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
