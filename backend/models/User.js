const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  userType: {
    type: String,
    enum: ['driver', 'maid'],
    required: true,
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a unique ID for the user
userSchema.statics.generateUniqueId = async function(userType) {
  const prefix = userType === 'driver' ? 'DRV' : 'MAD';
  let uniqueId;
  let isUnique = false;
  
  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    uniqueId = `${prefix}${randomNum}`;
    const existingUser = await this.findOne({ uniqueId });
    if (!existingUser) isUnique = true;
  }
  
  return uniqueId;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
