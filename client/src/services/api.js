// api.js - Axios Service and Client-Side Backend API Simulator for TransitOps
import axios from 'axios';
import { mockDb } from './mockDb';

// Create base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to simulate network latency
const sleep = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Custom adapter to mock HTTP requests locally
api.defaults.adapter = async (config) => {
  await sleep(600); // Simulate network latency

  const { url: rawUrl, method, data, headers } = config;
  const baseURL = config.baseURL || '';
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : (rawUrl.startsWith(baseURL) ? rawUrl : `${baseURL}${rawUrl}`);
  const url = fullUrl.replace(/^https?:\/\/[^\/]+/, '');

  // Hybrid database bypass: completed endpoints connect to the live MongoDB server
  if (url.includes('/auth') || url.includes('/vehicles') || url.includes('/drivers') || url.includes('/maintenance') || url.includes('/trips') || url.includes('/expenses') || url.includes('/reports') || url.includes('/users')) {
    const passConfig = { ...config, adapter: undefined };
    return axios(passConfig);
  }
  const body = data ? JSON.parse(data) : null;
  const authHeader = headers['Authorization'] || headers['authorization'];
  
  const isAuthRequired = !url.includes('/auth/login') && !url.includes('/auth/refresh');
  let currentUser = null;

  if (isAuthRequired) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { message: 'Authentication required. No token provided.' }
      };
    }
    const token = authHeader.split(' ')[1];
    // Check for simulated expired token
    if (token === 'expired_access_token') {
      return {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { message: 'Token expired', code: 'TOKEN_EXPIRED' }
      };
    }
    
    // Validate token format (allow both mock tokens and real JWTs)
    let userId = null;
    if (token.startsWith('mock_access_token_')) {
      userId = token.replace('mock_access_token_', '');
    } else {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          userId = payload.id;
        }
      } catch (e) {
        // Ignore parsing errors, fallback will handle it
      }
    }

    const users = mockDb.getUsers();
    currentUser = users.find(u => u.id === userId);
    if (!currentUser) {
      const savedUser = JSON.parse(localStorage.getItem('transitops_user') || 'null');
      if (savedUser) {
        currentUser = users.find(u => u.email?.toLowerCase() === savedUser.email?.toLowerCase());
      }
      if (!currentUser) {
        currentUser = users[0];
      }
    }
  }

  // --- API Endpoints Router ---
  
  // 1. Auth login
  if (url === '/api/auth/login' && method === 'post') {
    const { email, password } = body;
    const users = mockDb.getUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user || user.password !== password) {
      return {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
        data: { message: 'Invalid email or password' }
      };
    }

    // Generate tokens
    const accessToken = `mock_access_token_${user.id}`;
    const refreshToken = `mock_refresh_token_${user.id}`;

    const { password: _, ...userWithoutPassword } = user;

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    };
  }

  // 2. Auth Refresh Token
  if (url === '/api/auth/refresh' && method === 'post') {
    const { refreshToken } = body;
    if (!refreshToken || !refreshToken.startsWith('mock_refresh_token_')) {
      return {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
        data: { message: 'Invalid refresh token' }
      };
    }
    const userId = refreshToken.replace('mock_refresh_token_', '');
    const users = mockDb.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { message: 'User not found' }
      };
    }
    const nextAccessToken = `mock_access_token_${user.id}`;
    const nextRefreshToken = `mock_refresh_token_${user.id}`;
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken
      }
    };
  }

  // 3. Vehicles CRUD
  if (url === '/api/vehicles' && method === 'get') {
    const vehicles = mockDb.getVehicles();
    return { status: 200, statusText: 'OK', headers: {}, config, data: vehicles };
  }

  if (url === '/api/vehicles' && method === 'post') {
    // Validations (Zod-like schema constraints)
    const { registrationNumber, name, type, capacity, odometer, acquisitionCost, region, status } = body;

    if (!registrationNumber || registrationNumber.trim() === '') {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Registration number is required' } };
    }
    if (!capacity || Number(capacity) <= 0) {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Capacity must be greater than 0' } };
    }
    if (!acquisitionCost || Number(acquisitionCost) < 0) {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Acquisition cost must be positive' } };
    }

    const vehicles = mockDb.getVehicles();
    
    // Check duplication
    if (vehicles.some(v => v.registrationNumber.toUpperCase() === registrationNumber.toUpperCase())) {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Registration number already exists' } };
    }

    const newVehicle = {
      id: `v-${Date.now()}`,
      registrationNumber: registrationNumber.toUpperCase(),
      name,
      type,
      capacity: Number(capacity),
      odometer: Number(odometer || 0),
      acquisitionCost: Number(acquisitionCost),
      status: status || 'Available',
      region: region || 'Unassigned',
      fuelEfficiency: type.includes('Electric') ? 95.0 : 12.0,
      tripsCount: 0,
      operationalCost: 0
    };

    vehicles.push(newVehicle);
    mockDb.saveVehicles(vehicles);
    mockDb.addActivity('vehicle_added', `New ${newVehicle.name} (${newVehicle.registrationNumber}) added to fleet`);

    return { status: 201, statusText: 'Created', headers: {}, config, data: newVehicle };
  }

  if (url.startsWith('/api/vehicles/') && method === 'put') {
    const id = url.split('/').pop();
    const vehicles = mockDb.getVehicles();
    const index = vehicles.findIndex(v => v.id === id);

    if (index === -1) {
      return { status: 404, statusText: 'Not Found', headers: {}, config, data: { message: 'Vehicle not found' } };
    }

    const existing = vehicles[index];
    const { registrationNumber, name, type, capacity, odometer, acquisitionCost, region, status } = body;

    // Checks
    if (capacity && Number(capacity) <= 0) {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Capacity must be greater than 0' } };
    }
    if (acquisitionCost && Number(acquisitionCost) < 0) {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Acquisition cost must be positive' } };
    }

    // Reg duplicate check
    if (registrationNumber && registrationNumber.toUpperCase() !== existing.registrationNumber) {
      if (vehicles.some(v => v.id !== id && v.registrationNumber.toUpperCase() === registrationNumber.toUpperCase())) {
        return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Registration number already exists' } };
      }
    }

    const updated = {
      ...existing,
      registrationNumber: registrationNumber ? registrationNumber.toUpperCase() : existing.registrationNumber,
      name: name || existing.name,
      type: type || existing.type,
      capacity: capacity ? Number(capacity) : existing.capacity,
      odometer: odometer ? Number(odometer) : existing.odometer,
      acquisitionCost: acquisitionCost ? Number(acquisitionCost) : existing.acquisitionCost,
      status: status || existing.status,
      region: region || existing.region
    };

    // Log status change activity
    if (existing.status !== updated.status) {
      mockDb.addActivity('status_change', `${updated.name} status updated to ${updated.status}`);
    }

    vehicles[index] = updated;
    mockDb.saveVehicles(vehicles);

    return { status: 200, statusText: 'OK', headers: {}, config, data: updated };
  }

  if (url.startsWith('/api/vehicles/') && method === 'delete') {
    const id = url.split('/').pop();
    const vehicles = mockDb.getVehicles();
    const toDelete = vehicles.find(v => v.id === id);

    if (!toDelete) {
      return { status: 404, statusText: 'Not Found', headers: {}, config, data: { message: 'Vehicle not found' } };
    }

    const filtered = vehicles.filter(v => v.id !== id);
    mockDb.saveVehicles(filtered);
    mockDb.addActivity('vehicle_deleted', `${toDelete.name} (${toDelete.registrationNumber}) removed from fleet`);

    // Clean up associated maintenance tasks
    const maintenance = mockDb.getMaintenance().filter(m => m.vehicleId !== id);
    mockDb.saveMaintenance(maintenance);

    return { status: 200, statusText: 'OK', headers: {}, config, data: { message: 'Vehicle deleted successfully' } };
  }

  if (url === '/api/vehicles/bulk-delete' && method === 'post') {
    const { ids } = body;
    if (!ids || !Array.isArray(ids)) {
      return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'IDs array required' } };
    }

    const vehicles = mockDb.getVehicles();
    const filtered = vehicles.filter(v => !ids.includes(v.id));
    mockDb.saveVehicles(filtered);
    mockDb.addActivity('bulk_delete', `Removed ${ids.length} vehicles from fleet`);

    // Clean up associated maintenance tasks
    const maintenance = mockDb.getMaintenance().filter(m => !ids.includes(m.vehicleId));
    mockDb.saveMaintenance(maintenance);

    return { status: 200, statusText: 'OK', headers: {}, config, data: { message: 'Vehicles bulk deleted' } };
  }

  // 4. Maintenance CRUD
  if (url === '/api/maintenance' && method === 'get') {
    const maintenance = mockDb.getMaintenance();
    return { status: 200, statusText: 'OK', headers: {}, config, data: maintenance };
  }

  if (url === '/api/maintenance' && method === 'post') {
    const { vehicleId, type, description, cost, startDate, endDate, status } = body;
    
    // Validations
    if (!vehicleId) return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Vehicle is required' } };
    if (!type) return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Maintenance type is required' } };
    if (!description || description.trim() === '') return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Description is required' } };
    if (cost === undefined || Number(cost) < 0) return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Cost must be positive' } };
    if (!startDate) return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Start date is required' } };

    const vehicles = mockDb.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return { status: 400, statusText: 'Bad Request', headers: {}, config, data: { message: 'Invalid vehicle selected' } };

    const maintenance = mockDb.getMaintenance();
    const newRecord = {
      id: `m-${Date.now()}`,
      vehicleId,
      vehicleReg: vehicle.registrationNumber,
      vehicleName: vehicle.name,
      type,
      description,
      cost: Number(cost),
      startDate,
      endDate: endDate || '',
      status: status || 'Open'
    };

    maintenance.push(newRecord);
    mockDb.saveMaintenance(maintenance);

    // If maintenance is open, update vehicle status to "In Shop"
    if (newRecord.status === 'Open') {
      const vIndex = vehicles.findIndex(v => v.id === vehicleId);
      if (vIndex !== -1) {
        vehicles[vIndex].status = 'In Shop';
        // Add to operational cost
        vehicles[vIndex].operationalCost += newRecord.cost;
        mockDb.saveVehicles(vehicles);
      }
      mockDb.addActivity('maintenance_open', `Maintenance (#${newRecord.id}) opened for ${vehicle.name}`);
    } else {
      // Completed right away
      const vIndex = vehicles.findIndex(v => v.id === vehicleId);
      if (vIndex !== -1) {
        vehicles[vIndex].operationalCost += newRecord.cost;
        mockDb.saveVehicles(vehicles);
      }
      mockDb.addActivity('maintenance_close', `Maintenance (#${newRecord.id}) closed for ${vehicle.name}`);
    }

    return { status: 201, statusText: 'Created', headers: {}, config, data: newRecord };
  }

  if (url.startsWith('/api/maintenance/') && url.endsWith('/close') && method === 'put') {
    const id = url.split('/')[3]; // /api/maintenance/:id/close
    const maintenance = mockDb.getMaintenance();
    const index = maintenance.findIndex(m => m.id === id);

    if (index === -1) {
      return { status: 404, statusText: 'Not Found', headers: {}, config, data: { message: 'Maintenance record not found' } };
    }

    maintenance[index].status = 'Closed';
    maintenance[index].endDate = new Date().toISOString().split('T')[0];
    mockDb.saveMaintenance(maintenance);

    // Release vehicle back to "Available"
    const vehicles = mockDb.getVehicles();
    const vIndex = vehicles.findIndex(v => v.id === maintenance[index].vehicleId);
    if (vIndex !== -1) {
      vehicles[vIndex].status = 'Available';
      mockDb.saveVehicles(vehicles);
    }

    mockDb.addActivity('maintenance_close', `Maintenance (#${id}) closed for ${maintenance[index].vehicleName}`);

    return { status: 200, statusText: 'OK', headers: {}, config, data: maintenance[index] };
  }

  // 5. Dashboard Metrics & Analytics Endpoint
  if (url === '/api/dashboard/metrics' && method === 'get') {
    const vehicles = mockDb.getVehicles();
    const maintenance = mockDb.getMaintenance();
    const activities = mockDb.getActivities();

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const inShopVehicles = vehicles.filter(v => v.status === 'In Shop').length;

    // Derived statistics
    const activeTrips = activeVehicles * 2; // Simulated
    const pendingTrips = availableVehicles; // Simulated
    const driversOnDuty = activeVehicles + Math.floor(availableVehicles * 0.3);
    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    const totalCost = vehicles.reduce((sum, v) => sum + v.operationalCost, 0) + 
                      maintenance.reduce((sum, m) => sum + m.cost, 0);

    // Generate analytical trends
    const tripsPerDay = [
      { name: 'Mon', trips: 42 },
      { name: 'Tue', trips: 55 },
      { name: 'Wed', trips: 68 },
      { name: 'Thu', trips: 72 },
      { name: 'Fri', trips: 90 },
      { name: 'Sat', trips: 35 },
      { name: 'Sun', trips: 28 },
    ];

    const vehicleStatusPie = [
      { name: 'Active', value: activeVehicles, color: '#2563EB' },
      { name: 'Available', value: availableVehicles, color: '#22C55E' },
      { name: 'In Shop', value: inShopVehicles, color: '#F97316' }
    ];

    const maintenanceTrend = [
      { name: 'Feb', cost: 2400 },
      { name: 'Mar', cost: 1398 },
      { name: 'Apr', cost: 9800 },
      { name: 'May', cost: 3908 },
      { name: 'Jun', cost: 4800 },
      { name: 'Jul', cost: totalCost * 0.4 }, // Tied dynamically
    ];

    const fuelCostTrend = [
      { name: 'Feb', cost: 15400 },
      { name: 'Mar', cost: 17200 },
      { name: 'Apr', cost: 19800 },
      { name: 'May', cost: 16500 },
      { name: 'Jun', cost: 18900 },
      { name: 'Jul', cost: activeVehicles * 2100 }, // Tied dynamically
    ];

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {
        kpis: {
          totalVehicles,
          activeVehicles,
          availableVehicles,
          inShopVehicles,
          activeTrips,
          pendingTrips,
          driversOnDuty,
          fleetUtilization,
          operationalCost: totalCost
        },
        trends: {
          tripsPerDay,
          vehicleStatusPie,
          maintenanceTrend,
          fuelCostTrend
        },
        recentActivities: activities
      }
    };
  }

  // 6. Reports Metrics
  if (url === '/api/reports/metrics' && method === 'get') {
    const vehicles = mockDb.getVehicles();
    const maintenance = mockDb.getMaintenance();
    
    // Calculate report statistics
    const avgFuelEfficiency = vehicles.length > 0 
      ? (vehicles.reduce((sum, v) => sum + v.fuelEfficiency, 0) / vehicles.length).toFixed(1)
      : '0.0';

    const fleetUtilization = vehicles.length > 0 
      ? Math.round((vehicles.filter(v => v.status === 'Active').length / vehicles.length) * 100)
      : 0;

    const totalOdometer = vehicles.reduce((sum, v) => sum + v.odometer, 0);
    const totalCost = vehicles.reduce((sum, v) => sum + v.operationalCost, 0) + 
                      maintenance.reduce((sum, m) => sum + m.cost, 0);
    
    const roiScore = vehicles.length > 0
      ? (vehicles.reduce((sum, v) => sum + (v.tripsCount * 12 - v.operationalCost), 0) / vehicles.length).toFixed(0)
      : '0';

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {
        cards: {
          fuelEfficiency: `${avgFuelEfficiency} MPG`,
          fleetUtilization: `${fleetUtilization}%`,
          roiScore: `₹${roiScore}/veh`,
          operationalCost: `₹${totalCost.toLocaleString()}`
        },
        fuelEfficiencyData: vehicles.map(v => ({ name: v.registrationNumber, efficiency: v.fuelEfficiency })),
        costBreakdown: [
          { name: 'Acquisition', value: vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0) },
          { name: 'Maintenance', value: maintenance.reduce((sum, m) => sum + m.cost, 0) },
          { name: 'Fuel & Ops', value: vehicles.reduce((sum, v) => sum + v.operationalCost, 0) }
        ],
        vehicleUsageData: vehicles.map(v => ({ name: v.registrationNumber, trips: v.tripsCount }))
      }
    };
  }

  // Fallback 404
  return {
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
    data: { message: `Route not found: ${url}` }
  };
};

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_access_token');
    // Skip stale mock tokens — they cause "jwt malformed" on the real backend
    if (token && !token.startsWith('mock_')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    // If the mock adapter returns status >= 400, Axios doesn't automatically reject
    // unless we throw an error in the adapter or handle it in the interceptor.
    // In our case, the adapter returns { status, data, headers, config }.
    // We validate status and throw AxiosError if status >= 400 to match standard Axios behavior.
    if (response.status >= 400) {
      const error = new Error(response.data.message || 'API Error');
      error.response = response;
      error.status = response.status;
      throw error;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt token refresh for login route
    if (originalRequest.url && originalRequest.url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // JWT Token expired and request hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('transitops_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call API endpoint to refresh token
        // Use standard axios to bypass the local authorization headers injection
        const response = await axios.post('/api/auth/refresh', { refreshToken }, {
          adapter: api.defaults.adapter // Use the same custom mock adapter
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('transitops_access_token', accessToken);
        localStorage.setItem('transitops_refresh_token', newRefreshToken);

        // Update authorization header on the original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, clear credentials and redirect to login
        localStorage.removeItem('transitops_access_token');
        localStorage.removeItem('transitops_refresh_token');
        localStorage.removeItem('transitops_user');
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
