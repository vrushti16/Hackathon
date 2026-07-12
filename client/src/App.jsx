// App.jsx - Main routing registry and state context provider wrap
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/error/ErrorBoundary';
import OfflinePage from './components/error/OfflinePage';
import ErrorPage from './components/error/ErrorPage';
import { ROLES } from './auth/roleUtils';

// Lazy loaded Pages
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Signup = lazy(() => import('./pages/Signup'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const DriversPage = lazy(() => import('./pages/operations/DriversPage'));
const TripManagementPage = lazy(() => import('./pages/operations/TripManagementPage'));
const FuelPage = lazy(() => import('./pages/operations/FuelPage'));
const ExpensePage = lazy(() => import('./pages/operations/ExpensePage'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Profile = lazy(() => import('./pages/Profile'));

// Fallback loader for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-brand-slate-50 dark:bg-brand-slate-950">
    <Loader size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <OfflinePage>
        <ThemeProvider>
          <AuthProvider>
            <FleetProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
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

                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="vehicles" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}><Vehicles /></ProtectedRoute>} />
                      <Route path="maintenance" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}><Maintenance /></ProtectedRoute>} />
                      <Route path="reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FINANCIAL_ANALYST]}><Reports /></ProtectedRoute>} />
                      <Route path="settings" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Settings /></ProtectedRoute>} />
                      <Route path="drivers" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]}><DriversPage /></ProtectedRoute>} />
                      <Route path="trips" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER]}><TripManagementPage /></ProtectedRoute>} />
                      <Route path="fuel" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER]}><FuelPage /></ProtectedRoute>} />
                      <Route path="expenses" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FINANCIAL_ANALYST]}><ExpensePage /></ProtectedRoute>} />
                      <Route path="users" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><UserManagement /></ProtectedRoute>} />
                      <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Catch-all fallback 404 */}
                    <Route path="*" element={<ErrorPage type="404" />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </FleetProvider>
          </AuthProvider>
        </ThemeProvider>
      </OfflinePage>
    </ErrorBoundary>
  );
}

export default App;
