const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const generateToken = (userId, role) => {
  // no expiry since you don't want it
  return jwt.sign({ userId, role }, JWT_SECRET);
};

const verifyToken = (req, res, next) => {
  // Debug log to see what's happening
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    console.log('No token found');
    // 👇 send to correct login page (default admin)
    return res.redirect('/auth/login/admin');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    res.clearCookie('token');
    // 👇 send to correct login page (default admin)
    return res.redirect('/auth/login/admin');
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('No user in request');
      // 👇 send to correct login page (default admin)
      return res.redirect('/auth/login/admin');
    }
    
    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized:', req.user.role, 'Required:', roles);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};

const requireFarmer = requireRole(['farmer']);
const requireSeller = requireRole(['seller']);
const requireAdmin = requireRole(['admin']);

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  requireFarmer,
  requireSeller,
  requireAdmin,
  JWT_SECRET
};