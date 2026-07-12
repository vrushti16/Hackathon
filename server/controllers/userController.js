const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude password hashes
    const users = await User.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while retrieving users.' });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const emailLower = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const allowedRoles = ['Admin', 'Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role,
      isActive: true
    });

    // Strip password from returned user object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Create user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while creating user.' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, role, isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Safety rule: Admin cannot remove their own admin access without warning
    if (String(user._id) === String(req.user.id) && role && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own role from Admin.' });
    }

    if (name) user.name = name.trim();
    if (role) {
      const allowedRoles = ['Admin', 'Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role selected.' });
      }
      user.role = role;
    }
    if (isActive !== undefined) {
      // Safety rule: Admin cannot deactivate themselves
      if (String(user._id) === String(req.user.id) && !isActive) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
      }
      user.isActive = isActive;
    }

    const updatedUser = await user.save();
    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while updating user.' });
  }
};

// PATCH /api/users/:id/status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot toggle your own active status.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Toggle status error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error toggling user status.' });
  }
};

// POST /api/users/:id/reset-password
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'User password reset successfully.' });
  } catch (error) {
    console.error('Reset user password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while resetting user password.' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Safety rule: Deleting last active Admin is forbidden
    if (userToDelete.role === 'Admin') {
      const activeAdminsCount = await User.countDocuments({ role: 'Admin', isActive: true });
      if (activeAdminsCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last active Admin account.' });
      }
    }

    // Unlink driver user if driver profile exists
    await Driver.updateMany({ user: userId }, { $unset: { user: 1 } });

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ success: true, message: 'User successfully removed.' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while deleting user.' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser
};
