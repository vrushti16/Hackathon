const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectRoute = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

      const authenticatedUser = await User.findById(decodedPayload.id);
      
      if (!authenticatedUser) {
        return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
      }

      // Check if user is active
      if (authenticatedUser.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive. Contact the administrator.'
        });
      }

      req.user = authenticatedUser;
      next();
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token is invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no session token was provided.' });
  }
};

module.exports = { protectRoute };
