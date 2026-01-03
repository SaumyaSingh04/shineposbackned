const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  adminEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  adminName: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: {
    type: String,
    default: 'US'
  },
  cuisine: String,
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['trial', 'basic', 'premium', 'enterprise'],
    default: 'trial'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);