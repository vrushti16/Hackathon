const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  // Get token from headers
  const token = req.headers['token'];

  // If there is no token
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = { protect };
