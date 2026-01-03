const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: mongoose.Schema.Types.Mixed,
  category: {
    type: String,
    enum: ['system', 'billing', 'notifications', 'features'],
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);