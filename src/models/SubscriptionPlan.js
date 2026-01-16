const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['standard']
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  features: [{
    type: String
  }],
  limits: {
    orders: { type: Number, default: -1 }, // -1 means unlimited
    users: { type: Number, default: -1 },
    menuItems: { type: Number, default: -1 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
