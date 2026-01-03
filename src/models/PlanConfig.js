const mongoose = require('mongoose');

const planConfigSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['trial', 'basic', 'premium', 'enterprise'],
    required: true,
    unique: true
  },
  pricing: {
    monthly: { type: Number, required: true },
    yearly: { type: Number, required: true }
  },
  limits: {
    orders: { type: Number, required: true },
    storage: { type: Number, required: true },
    users: { type: Number, required: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlanConfig', planConfigSchema);