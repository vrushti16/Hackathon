const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectRoute = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

      // Security decision: Exclude password hashes from request context to prevent downstream leaks
      const authenticatedUser = await User.findById(decodedPayload.id).select('-password');
      
      if (!authenticatedUser) {
        return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
      }

      req.user = authenticatedUser;
      next();
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token is invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no session token was provided.' });
  }
};

module.exports = { protectRoute };
