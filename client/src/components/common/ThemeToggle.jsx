// ThemeToggle.jsx - Quick theme switcher button
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 text-brand-slate-500 dark:text-brand-slate-400 hover:text-brand-blue dark:hover:text-brand-blue hover:bg-brand-slate-50 dark:hover:bg-brand-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 animate-scale-in text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 animate-scale-in" />
      )}
    </button>
  );
};

export default ThemeToggle;
