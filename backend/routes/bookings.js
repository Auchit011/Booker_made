const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const Maid = require('../models/Maid');
const User = require('../models/User');
const { authenticate, isServiceProvider } = require('../middleware/auth');

// @route   POST /bookings
// @desc    Create a new booking (customer books a driver or maid)
// @access  Public
router.post(
  '/',
  [
    check('customer_name', 'Customer name is required').not().isEmpty(),
    check('customer_phone', 'Customer phone is required').not().isEmpty(),
    check('service_type', 'Service type must be either driver or maid').isIn(['driver', 'maid']),
    check('serviceProviderUniqueId', 'Service provider user_id is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      customer_name,
      customer_phone,
      service_type,
      serviceProviderUniqueId,
      date,
      time,
      address,
      notes
    } = req.body;
    try {
      console.log('Creating booking with data:', req.body);
      const ProviderModel = service_type === 'maid' ? Maid : Driver;
      const provider = await ProviderModel.findOne({ user_id: serviceProviderUniqueId });
      
      if (!provider) {
        console.log('Provider not found with user_id:', serviceProviderUniqueId);
        return res.status(404).json({ errors: [{ msg: 'Service provider not found' }] });
      }
      
      console.log('Found provider:', provider);

      console.log('Creating new booking...');
      const booking = new Booking({
        customer_name,
        customer_phone,
        service_type,
        date,
        time,
        address,
        notes,
        assigned_to_user_id: provider.user_id,
        service_provider_id: provider._id,  // Add reference to the provider
        status: 'pending'
      });
      
      console.log('Saving booking:', booking);
      await booking.save();
      
      console.log('Adding booking to provider\'s bookings array');
      provider.bookings.push(booking._id);
      await provider.save();
      res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /bookings/me
// @desc    Get all bookings for the logged-in service provider
// @access  Private (Service Provider)
router.get('/me', authenticate, isServiceProvider, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      serviceProviderId: req.user.id 
    }).sort({ date: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /bookings/available-providers
// @desc    Get all available service providers by type
// @access  Public
router.get('/available-providers', async (req, res) => {
  try {
    const { type } = req.query;
    console.log('Fetching available providers for type:', type);
    
    if (!type || !['driver', 'maid'].includes(type)) {
      return res.status(400).json({ 
        errors: [{ msg: 'Please provide a valid service type (driver or maid)' }] 
      });
    }

    const Model = type === 'maid' ? Maid : Driver;
    const providers = await Model.find({}).select('-password');

    res.json(providers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /bookings/:id/status
// @desc    Update booking status
// @access  Private (Service Provider)
router.put('/:id/status', authenticate, isServiceProvider, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the booking belongs to the logged-in service provider
    if (booking.assigned_to_user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /bookings/:id/rate
// @desc    Rate a completed booking
// @access  Private (Customer)
router.put(
  '/:id/rate',
  [
    check('rating', 'Please provide a rating between 1 and 5').isInt({ min: 1, max: 5 }),
    check('review', 'Review must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, review } = req.body;

    try {
      let booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ 
          errors: [{ msg: 'Booking not found' }] 
        });
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ 
          errors: [{ msg: 'You can only rate completed bookings' }] 
        });
      }

      // Update rating and review
      booking.rating = { score: rating, review };
      booking.updatedAt = Date.now();
      
      await booking.save();

      // Update service provider's average rating
      await updateServiceProviderRating(booking.serviceProviderId);

      res.json({ 
        message: 'Thank you for your feedback!',
        booking 
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Helper function to update service provider's average rating
async function updateServiceProviderRating(providerId) {
  try {
    const result = await Booking.aggregate([
      { $match: { 
        serviceProviderId: providerId,
        'rating.score': { $exists: true }
      }},
      { $group: {
        _id: '$serviceProviderId',
        averageRating: { $avg: '$rating.score' },
        totalRatings: { $sum: 1 }
      }}
    ]);

    if (result.length > 0) {
      await User.findByIdAndUpdate(providerId, { 
        rating: Math.round(result[0].averageRating * 10) / 10
      });
    }
  } catch (err) {
    console.error('Error updating service provider rating:', err);
  }
}

// @route   PUT /api/profile/availability
// @desc    Update service provider availability
// @access  Private (Service Provider)
router.put(
  '/profile/availability',
  [
    authenticate,
    isServiceProvider,
    check('isAvailable', 'Availability status is required').isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { isAvailable } },
        { new: true }
      ).select('-password');

      res.json({ 
        message: `You are now ${isAvailable ? 'available' : 'unavailable'} for bookings`,
        user 
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /bookings/my-dashboard
// @desc    Get all bookings for the logged-in driver or maid
// @access  Private (Service Provider)
router.get('/my-dashboard', authenticate, async (req, res) => {
  try {
    const { user_id, role } = req.user;
    console.log('Fetching dashboard for user:', { user_id, role });

    // Find all bookings assigned to this provider
    const bookings = await Booking.find({ 
      $or: [
        { assigned_to_user_id: user_id },
        { serviceProviderUniqueId: user_id } // For backward compatibility
      ]
    }).sort({ createdAt: -1 });

    console.log('Found bookings:', JSON.stringify(bookings, null, 2));

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for user:', user_id);
    }

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        _id: booking._id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        service_type: booking.service_type,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        notes: booking.notes,
        status: booking.status || 'pending',
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }))
    });
  } catch (err) {
    console.error('Error in /my-dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
  }
});

module.exports = router;
