// mockDb.js - Client-side LocalStorage Database Simulator for TransitOps

const DEFAULT_USER = {
  id: "user-1",
  email: "admin@transitops.com",
  name: "Sarah Jenkins",
  role: "Fleet Administrator",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  password: "password123" // Simple plain text check for mock purposes
};

const INITIAL_VEHICLES = [
  {
    id: "v-1",
    registrationNumber: "TX-9087-A",
    name: "Freightliner Cascadia",
    type: "Heavy Duty Truck",
    capacity: 25000,
    odometer: 145200,
    acquisitionCost: 125000,
    status: "Active",
    region: "North America",
    fuelEfficiency: 6.5, // MPG
    tripsCount: 48,
    operationalCost: 8500
  },
  {
    id: "v-2",
    registrationNumber: "CA-4521-B",
    name: "Ford E-Transit Van",
    type: "Electric Van",
    capacity: 3500,
    odometer: 18200,
    acquisitionCost: 55000,
    status: "Available",
    region: "West Coast",
    fuelEfficiency: 95.0, // MPGe
    tripsCount: 124,
    operationalCost: 1200
  },
  {
    id: "v-3",
    registrationNumber: "NY-8890-C",
    name: "Volvo VNL 860",
    type: "Heavy Duty Truck",
    capacity: 26000,
    odometer: 289400,
    acquisitionCost: 145000,
    status: "In Shop",
    region: "East Coast",
    fuelEfficiency: 6.2,
    tripsCount: 92,
    operationalCost: 14200
  },
  {
    id: "v-4",
    registrationNumber: "FL-2104-D",
    name: "Mercedes-Benz Sprinter",
    type: "Cargo Van",
    capacity: 4500,
    odometer: 74100,
    acquisitionCost: 48000,
    status: "Active",
    region: "South Region",
    fuelEfficiency: 14.5,
    tripsCount: 210,
    operationalCost: 3900
  },
  {
    id: "v-5",
    registrationNumber: "IL-6732-E",
    name: "Isuzu NPR-HD",
    type: "Box Truck",
    capacity: 12000,
    odometer: 98600,
    acquisitionCost: 65000,
    status: "Available",
    region: "Midwest",
    fuelEfficiency: 8.8,
    tripsCount: 75,
    operationalCost: 5400
  },
  {
    id: "v-6",
    registrationNumber: "TX-7741-F",
    name: "Ram ProMaster 3500",
    type: "Cargo Van",
    capacity: 4200,
    odometer: 42300,
    acquisitionCost: 42000,
    status: "Active",
    region: "North America",
    fuelEfficiency: 13.8,
    tripsCount: 115,
    operationalCost: 2600
  },
  {
    id: "v-7",
    registrationNumber: "WA-5591-G",
    name: "Peterbilt 579",
    type: "Heavy Duty Truck",
    capacity: 25000,
    odometer: 312000,
    acquisitionCost: 135000,
    status: "In Shop",
    region: "West Coast",
    fuelEfficiency: 6.0,
    tripsCount: 154,
    operationalCost: 19500
  },
  {
    id: "v-8",
    registrationNumber: "OH-3382-H",
    name: "Chevrolet Express 2500",
    type: "Cargo Van",
    capacity: 3200,
    odometer: 112500,
    acquisitionCost: 38000,
    status: "Available",
    region: "Midwest",
    fuelEfficiency: 12.0,
    tripsCount: 185,
    operationalCost: 4700
  }
];

const INITIAL_MAINTENANCE = [
  {
    id: "m-1",
    vehicleId: "v-3",
    vehicleReg: "NY-8890-C",
    vehicleName: "Volvo VNL 860",
    type: "Repair",
    description: "Transmission slip issues, replacing torque converter and fluid flush.",
    cost: 3850,
    startDate: "2026-07-08",
    endDate: "2026-07-14",
    status: "Open"
  },
  {
    id: "m-2",
    vehicleId: "v-7",
    vehicleReg: "WA-5591-G",
    vehicleName: "Peterbilt 579",
    type: "Routine",
    description: "Brake pads replacement, coolant exchange, and engine oil filter service.",
    cost: 1200,
    startDate: "2026-07-11",
    endDate: "2026-07-13",
    status: "Open"
  },
  {
    id: "m-3",
    vehicleId: "v-1",
    vehicleReg: "TX-9087-A",
    vehicleName: "Freightliner Cascadia",
    type: "Inspection",
    description: "Annual Department of Transportation (DOT) compliance safety check.",
    cost: 250,
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    status: "Closed"
  },
  {
    id: "m-4",
    vehicleId: "v-4",
    vehicleReg: "FL-2104-D",
    vehicleName: "Mercedes-Benz Sprinter",
    type: "Routine",
    description: "Regular mileage oil service and tire rotations.",
    cost: 180,
    startDate: "2026-06-20",
    endDate: "2026-06-20",
    status: "Closed"
  },
  {
    id: "m-5",
    vehicleId: "v-2",
    vehicleReg: "CA-4521-B",
    vehicleName: "Ford E-Transit Van",
    type: "Repair",
    description: "Charging port pins damaged, replaced port harness assembly.",
    cost: 850,
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    status: "Closed"
  }
];

const INITIAL_ACTIVITIES = [
  { id: "act-1", type: "maintenance_open", message: "Maintenance order #m-2 opened for Peterbilt 579", time: "2 hours ago" },
  { id: "act-2", type: "status_change", message: "Ford E-Transit Van is now Available", time: "4 hours ago" },
  { id: "act-3", type: "vehicle_added", message: "New Chevrolet Express 2500 added to Midwest fleet", time: "1 day ago" },
  { id: "act-4", type: "maintenance_close", message: "Maintenance order #m-3 completed for Freightliner Cascadia", time: "2 days ago" },
  { id: "act-5", type: "status_change", message: "Volvo VNL 860 status updated to In Shop", time: "4 days ago" }
];

export const initDb = () => {
  if (!localStorage.getItem("transitops_users")) {
    localStorage.setItem("transitops_users", JSON.stringify([DEFAULT_USER]));
  }
  if (!localStorage.getItem("transitops_vehicles")) {
    localStorage.setItem("transitops_vehicles", JSON.stringify(INITIAL_VEHICLES));
  }
  if (!localStorage.getItem("transitops_maintenance")) {
    localStorage.setItem("transitops_maintenance", JSON.stringify(INITIAL_MAINTENANCE));
  }
  if (!localStorage.getItem("transitops_activities")) {
    localStorage.setItem("transitops_activities", JSON.stringify(INITIAL_ACTIVITIES));
  }
};

// Initialize instantly
initDb();

export const mockDb = {
  // Authentication
  getUsers: () => JSON.parse(localStorage.getItem("transitops_users") || "[]"),
  
  // Vehicles CRUD
  getVehicles: () => JSON.parse(localStorage.getItem("transitops_vehicles") || "[]"),
  saveVehicles: (vehicles) => localStorage.setItem("transitops_vehicles", JSON.stringify(vehicles)),
  
  // Maintenance CRUD
  getMaintenance: () => JSON.parse(localStorage.getItem("transitops_maintenance") || "[]"),
  saveMaintenance: (records) => localStorage.setItem("transitops_maintenance", JSON.stringify(records)),
  
  // Activities
  getActivities: () => JSON.parse(localStorage.getItem("transitops_activities") || "[]"),
  addActivity: (type, message) => {
    const activities = JSON.parse(localStorage.getItem("transitops_activities") || "[]");
    activities.unshift({
      id: `act-${Date.now()}`,
      type,
      message,
      time: "Just now"
    });
    localStorage.setItem("transitops_activities", JSON.stringify(activities.slice(0, 15)));
  }
};
