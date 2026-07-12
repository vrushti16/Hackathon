export const ROLE_PERMISSIONS = {
  Admin: [
    "dashboard",
    "vehicles",
    "drivers",
    "trips",
    "maintenance",
    "fuel",
    "expenses",
    "reports",
    "analytics",
    "users",
    "settings",
    "licenses",
    "safety"
  ],

  "Fleet Manager": [
    "dashboard",
    "vehicles",
    "drivers-view",
    "trips",
    "maintenance",
    "fuel",
    "fleet-analytics"
  ],

  Driver: [
    "driver-dashboard",
    "my-trips",
    "trip-details",
    "start-trip",
    "complete-trip",
    "fuel-create",
    "my-profile",
    "notifications"
  ],

  "Safety Officer": [
    "safety-dashboard",
    "drivers",
    "licenses",
    "safety",
    "compliance-alerts"
  ],

  "Financial Analyst": [
    "financial-dashboard",
    "expenses",
    "reports",
    "financial-analytics",
    "exports"
  ]
};
