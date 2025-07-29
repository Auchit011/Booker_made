const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const Maid = require('../models/Maid');
const generateUserId = require('../utils/generateUserId');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


// mongodb solved 
// @route   POST /auth/register
// @desc    Register a new driver or maid
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['driver', 'maid']),
    check('phone', 'Phone number is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;
    try {
      const Model = role === 'maid' ? Maid : Driver;
      let user = await Model.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
      const user_id = generateUserId(role);
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new Model({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        user_id,
        bookings: []
      });
      await user.save();
      const payload = {
        user: {
          id: user._id,
          user_id: user.user_id,
          role: user.role
        }
      };
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              user_id: user.user_id
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST /auth/login
// @desc    Authenticate driver or maid & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('role', 'Role is required').isIn(['driver', 'maid'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, role } = req.body;
    try {
      const Model = role === 'maid' ? Maid : Driver;
      const user = await Model.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      const isMatch = await require('bcryptjs').compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      const payload = {
        user: {
          id: user._id,
          user_id: user.user_id,
          role: user.role
        }
      };
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              user_id: user.user_id
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /auth/user
// @desc    Get user data
// @access  Private
router.get('/user', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const Model = role === 'maid' ? Maid : Driver;
    
    console.log('Looking up user:', { user_id, role });
    const user = await Model.findOne({ user_id }).select('-password');
    
    if (!user) {
      console.log('User not found in /auth/user route');
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('User found:', { id: user._id, user_id: user.user_id, role });
    res.json({ ...user.toObject(), role });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
