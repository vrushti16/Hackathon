// Sidebar.jsx - Application navigation panel
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-brand-slate-950 border-r border-brand-slate-200 dark:border-brand-slate-900 transition-all duration-300 relative">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-brand-slate-100 dark:border-brand-slate-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-brand-blue/30">
            T
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight font-display bg-gradient-to-r from-brand-slate-900 to-brand-slate-700 dark:from-white dark:to-brand-slate-200 bg-clip-text text-transparent">
              TransitOps
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Button (Desktop Only) */}
        <button
          onClick={onToggleCollapse}
          type="button"
          className="hidden md:flex absolute -right-3 top-6 p-1 rounded-full border border-brand-slate-200 dark:border-brand-slate-800 bg-white dark:bg-brand-slate-950 text-brand-slate-400 dark:text-brand-slate-500 hover:text-brand-blue dark:hover:text-brand-blue shadow-sm hover:scale-105 transition-all cursor-pointer z-20"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group focus:outline-none ${
                  isActive
                    ? 'sidebar-active-gradient text-brand-blue bg-brand-blue/5'
                    : 'text-brand-slate-500 dark:text-brand-slate-400 hover:text-brand-slate-800 dark:hover:text-brand-slate-200 hover:bg-brand-slate-100/50 dark:hover:bg-brand-slate-900/30'
                }`
              }
              onClick={onClose} // Closes drawer on mobile
            >
              <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="animate-fade-in">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Profile Foot */}
      <div className="p-4 border-t border-brand-slate-100 dark:border-brand-slate-900">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-4 px-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-brand-slate-200 dark:border-brand-slate-800"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-slate-200 dark:bg-brand-slate-800 flex items-center justify-center font-bold text-sm text-brand-slate-600 dark:text-brand-slate-350">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-slate-800 dark:text-white truncate font-display">
                {user?.name}
              </p>
              <p className="text-[10px] font-medium text-brand-slate-400 dark:text-brand-slate-500 truncate">
                {user?.role || 'Fleet Admin'}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          type="button"
          className={`flex items-center space-x-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-red hover:bg-brand-red/5 w-full transition-all duration-200 group focus:outline-none cursor-pointer`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Side Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-slate-900/40 dark:bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* 2. Mobile Drawer Panel */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 md:hidden transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* 3. Desktop Permanent Sidebar */}
      <div 
        className={`hidden md:block h-screen flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
