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
import ForgotPassword from './pages/ForgotPassword';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DriversPage from './pages/operations/DriversPage';
import TripManagementPage from './pages/operations/TripManagementPage';
import FuelPage from './pages/operations/FuelPage';
import ExpensePage from './pages/operations/ExpensePage';
import UserManagement from './pages/UserManagement';
import { ROLES } from './auth/roleUtils';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FleetProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Authenticated Dashboard Core */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vehicles" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}><Vehicles /></ProtectedRoute>} />
                <Route path="maintenance" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}><Maintenance /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FINANCIAL_ANALYST]}><Reports /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Settings /></ProtectedRoute>} />
                <Route path="drivers" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SAFETY_OFFICER]}><DriversPage /></ProtectedRoute>} />
                <Route path="trips" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER]}><TripManagementPage /></ProtectedRoute>} />
                <Route path="fuel" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DRIVER]}><FuelPage /></ProtectedRoute>} />
                <Route path="expenses" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FINANCIAL_ANALYST]}><ExpensePage /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><UserManagement /></ProtectedRoute>} />
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
