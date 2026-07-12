const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser
} = require('../controllers/userController');
const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All user management routes require Admin privileges
router.use(protectRoute);
router.use(authorizeRoles('Admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

router.patch('/:id/status', toggleUserStatus);
router.post('/:id/reset-password', resetUserPassword);

module.exports = router;
