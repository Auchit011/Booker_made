const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (filtered by type and availability)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { userType, isAvailable } = req.query;
    
    const query = {};
    if (userType) {
      query.userType = userType;
    }
    if (isAvailable === 'true') {
      query.isAvailable = true;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
