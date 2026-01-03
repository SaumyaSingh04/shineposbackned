const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ANNOUNCEMENT', 'NOTIFICATION', 'ALERT', 'UPDATE'],
    default: 'ANNOUNCEMENT'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  recipients: {
    type: String,
    enum: ['ALL', 'ACTIVE', 'TRIAL', 'SPECIFIC'],
    default: 'ALL'
  },
  specificRestaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Communication', communicationSchema);