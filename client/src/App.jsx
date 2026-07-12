// App.jsx - Main routing registry and state context provider wrap
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FleetProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<Login />} />

              {/* Authenticated Dashboard Core */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Redirect default root path to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all fallback redirects to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </FleetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
