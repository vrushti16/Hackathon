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
import Unauthorized from './pages/Unauthorized';
import ForgotPassword from './pages/ForgotPassword';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DriversPage from './pages/operations/DriversPage';
import TripManagementPage from './pages/operations/TripManagementPage';
import FuelPage from './pages/operations/FuelPage';
import ExpensePage from './pages/operations/ExpensePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FleetProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
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
                {/* Redirect default root path to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                <Route path="dashboard" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="vehicles" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager']}>
                    <Vehicles />
                  </ProtectedRoute>
                } />
                <Route path="maintenance" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager']}>
                    <Maintenance />
                  </ProtectedRoute>
                } />
                <Route path="reports" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Financial Analyst']}>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="drivers" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer']}>
                    <DriversPage />
                  </ProtectedRoute>
                } />
                <Route path="trips" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager']}>
                    <TripManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="fuel" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Driver']}>
                    <FuelPage />
                  </ProtectedRoute>
                } />
                <Route path="expenses" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Financial Analyst']}>
                    <ExpensePage />
                  </ProtectedRoute>
                } />
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
