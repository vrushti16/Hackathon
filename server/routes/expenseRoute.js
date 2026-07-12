const express = require('express');
const router = express.Router();
const {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  deleteFuelLog,
  createExpense,
  getExpenses,
  getVehicleCostBreakdown,
  deleteExpense
} = require('../controllers/expenseController');
const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ─── FUEL LOG ROUTES ────────────────────────────────────────────────

// POST   /api/expenses/fuel          — Record fuel fill-up (Driver / Admin)
router.post('/fuel', protectRoute, authorizeRoles('Driver', 'Admin'), createFuelLog);

// GET    /api/expenses/fuel          — List fuel logs (any authenticated user)
router.get('/fuel', protectRoute, getFuelLogs);

// GET    /api/expenses/fuel/:id      — Get single fuel log
router.get('/fuel/:id', protectRoute, getFuelLogById);

// DELETE /api/expenses/fuel/:id      — Delete fuel log (Admin only)
router.delete('/fuel/:id', protectRoute, authorizeRoles('Admin'), deleteFuelLog);

// ─── EXPENSE ROUTES ─────────────────────────────────────────────────

// POST   /api/expenses               — Log a direct expense (FinancialAnalyst / Admin)
router.post('/', protectRoute, authorizeRoles('FinancialAnalyst', 'Admin'), createExpense);

// GET    /api/expenses               — List all expenses (any authenticated user)
router.get('/', protectRoute, getExpenses);

// GET    /api/expenses/vehicle/:vehicleId — Full cost breakdown for a vehicle
router.get('/vehicle/:vehicleId', protectRoute, getVehicleCostBreakdown);

// DELETE /api/expenses/:id           — Delete an expense (Admin only)
router.delete('/:id', protectRoute, authorizeRoles('Admin'), deleteExpense);

module.exports = router;
