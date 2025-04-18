const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to authenticate JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const { rows } = await db.query(
      'SELECT id, name, email, role, store_id FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user to request object
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Middleware to check user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resource'
      });
    }
    
    next();
  };
};
