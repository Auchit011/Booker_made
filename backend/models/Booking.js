const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: true,
    trim: true,
  },
  customer_phone: {
    type: String,
    required: true,
    trim: true,
  },
  service_type: {
    type: String,
    enum: ['driver', 'maid'],
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  service_provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'service_type_model'
  },
  service_type_model: {
    type: String,
    required: true,
    enum: ['Maid', 'Driver'],
    default: function() {
      return this.service_type === 'maid' ? 'Maid' : 'Driver';
    }
  },
  assigned_to_user_id: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true,
  },
  assigned_to_user_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
