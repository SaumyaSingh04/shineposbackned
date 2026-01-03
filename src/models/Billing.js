const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
    default: 'TRIAL'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  trialEnd: Date,
  lastPayment: Date,
  nextPayment: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Billing', billingSchema);