const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');
const Maid = require('../models/Maid');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to verify JWT token
exports.authenticate = async (req, res, next) => {
  console.log('Auth middleware called', {
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    // Check if no token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Get token from Bearer header
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload based on role
    const Model = decoded.user.role === 'maid' ? Maid : Driver;
    console.log('Finding user with:', {
      role: decoded.user.role,
      user_id: decoded.user.user_id
    });
    
    const user = await Model.findOne({ user_id: decoded.user.user_id }).select('-password');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ error: 'Token is not valid' });
    }

    console.log('User found:', {
      id: user._id,
      user_id: user.user_id,
      role: decoded.user.role
    });

    req.user = { ...user.toObject(), role: decoded.user.role };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token is not valid' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware to check if user is a driver
exports.isDriver = (req, res, next) => {
  if (req.user && req.user.userType === 'driver') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Drivers only.' });
  }
};

// Middleware to check if user is a maid
exports.isMaid = (req, res, next) => {
  if (req.user && req.user.userType === 'maid') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Maids only.' });
  }
};

// Middleware to check if user is either driver or maid
exports.isServiceProvider = (req, res, next) => {
  if (req.user && (req.user.userType === 'driver' || req.user.userType === 'maid')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Service providers only.' });
  }
};
