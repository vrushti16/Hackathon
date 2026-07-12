// FleetContext.jsx - Fleet data state, global filters, and toast notifications
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const FleetContext = createContext();

export const FleetProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loading, setLoading] = useState({
    vehicles: false,
    maintenance: false,
    dashboard: false
  });

  // Global Filter State
  const [filters, setFilters] = useState({
    vehicleType: 'All',
    status: 'All',
    region: 'All'
  });

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const triggerToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Update a single filter field
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      vehicleType: 'All',
      status: 'All',
      region: 'All'
    });
  }, []);

  // Fetch Dashboard Metrics
  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardMetrics(response.data);
    } catch (err) {
      triggerToast(err.message || 'Failed to load dashboard metrics', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, [triggerToast]);

  // Normalize backend vehicle fields to match frontend expectations
  const normalizeVehicle = (v) => ({
    id: v._id || v.id,
    registrationNumber: v.registrationNumber,
    name: v.modelName || v.name || '',
    type: v.type,
    capacity: v.maxLoadCapacity ?? v.capacity ?? 0,
    odometer: v.odometer ?? 0,
    acquisitionCost: v.acquisitionCost ?? 0,
    status: v.status || 'Available',
    region: v.region || '',
    ...v
  });

  const normalizeMaintenance = (item) => ({
    id: item._id || item.id,
    vehicleId: item.vehicle?._id || item.vehicleId || item.vehicle,
    vehicleReg: item.vehicle?.registrationNumber || item.vehicleReg || '',
    vehicleName: item.vehicle?.modelName || item.vehicleName || '',
    type: item.type || 'Routine',
    description: item.description || '',
    cost: item.cost || 0,
    startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
    endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
    status: item.status === 'Active' ? 'Open' : item.status || 'Open',
    ...item
  });

  // Fetch Vehicles
  const fetchVehicles = useCallback(async () => {
    setLoading(prev => ({ ...prev, vehicles: true }));
    try {
      const response = await api.get('/vehicles');
      const raw = Array.isArray(response.data) ? response.data : (response.data.vehicles || []);
      setVehicles(raw.map(normalizeVehicle));
    } catch (err) {
      triggerToast(err.message || 'Failed to fetch vehicles', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, [triggerToast]);

  // Fetch Maintenance Records
  const fetchMaintenance = useCallback(async () => {
    setLoading(prev => ({ ...prev, maintenance: true }));
    try {
      const response = await api.get('/maintenance');
      const raw = Array.isArray(response.data) ? response.data : (response.data.maintenance || []);
      setMaintenance(raw.map(normalizeMaintenance));
    } catch (err) {
      triggerToast(err.message || 'Failed to fetch maintenance records', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, maintenance: false }));
    }
  }, [triggerToast]);

  // Add Vehicle
  const addVehicle = async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      setVehicles(prev => [...prev, response.data]);
      triggerToast('Vehicle added successfully', 'success');
      // Refresh dashboard since metrics changed
      fetchDashboardMetrics();
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add vehicle';
      triggerToast(msg, 'danger');
      throw new Error(msg);
    }
  };

  // Update Vehicle
  const updateVehicle = async (id, vehicleData) => {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      setVehicles(prev => prev.map(v => v.id === id ? response.data : v));
      triggerToast('Vehicle updated successfully', 'success');
      fetchDashboardMetrics();
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update vehicle';
      triggerToast(msg, 'danger');
      throw new Error(msg);
    }
  };

  // Delete Vehicle
  const deleteVehicle = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
      // Clean up maintenance locally
      setMaintenance(prev => prev.filter(m => m.vehicleId !== id));
      triggerToast('Vehicle removed from fleet', 'success');
      fetchDashboardMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete vehicle';
      triggerToast(msg, 'danger');
      throw new Error(msg);
    }
  };

  // Bulk Delete Vehicles
  const bulkDeleteVehicles = async (ids) => {
    try {
      await api.post('/vehicles/bulk-delete', { ids });
      setVehicles(prev => prev.filter(v => !ids.includes(v.id)));
      setMaintenance(prev => prev.filter(m => !ids.includes(m.vehicleId)));
      triggerToast(`${ids.length} vehicles removed from fleet`, 'success');
      fetchDashboardMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete selected vehicles';
      triggerToast(msg, 'danger');
      throw new Error(msg);
    }
  };

  // Add Maintenance Record
  const addMaintenance = async (maintenanceData) => {
    try {
      const response = await api.post('/maintenance', maintenanceData);
      setMaintenance(prev => [...prev, normalizeMaintenance(response.data)]);
      triggerToast('Maintenance task created', 'success');
      
      // Since vehicle status changes to "In Shop", reload both sets of states
      fetchVehicles();
      fetchDashboardMetrics();
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add maintenance';
      triggerToast(msg, 'danger');
      throw new Error(msg);
    }
  };

  // Close Maintenance Record (Mark as Completed)
  const closeMaintenance = async (id) => {
    try {
      const response = await api.put(`/maintenance/${id}/close`);
      setMaintenance(prev => prev.map(m => m.id === id ? normalizeMaintenance(response.data) : m));
      triggerToast('Maintenance ticket closed', 'success');
      
      // Refresh vehicle list and dashboard metrics
      fetchVehicles();
      fetchDashboardMetrics();
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to close maintenance';
      triggerToast(msg, 'danger');
      throw new Error(msg);
    }
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        maintenance,
        dashboardMetrics,
        loading,
        filters,
        toasts,
        triggerToast,
        dismissToast,
        updateFilter,
        resetFilters,
        fetchDashboardMetrics,
        fetchVehicles,
        fetchMaintenance,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        bulkDeleteVehicles,
        addMaintenance,
        closeMaintenance
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
