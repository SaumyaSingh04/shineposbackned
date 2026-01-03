const mongoose = require('mongoose');

const systemHealthSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  serverStatus: {
    uptime: Number,
    memoryUsage: {
      rss: Number,
      heapTotal: Number,
      heapUsed: Number,
      external: Number
    },
    cpuUsage: Number
  },
  databaseStatus: {
    connected: Boolean,
    responseTime: Number,
    activeConnections: Number
  },
  apiMetrics: {
    totalRequests: Number,
    errorRate: Number,
    averageResponseTime: Number
  }
}, {
  timestamps: true,
  expires: 604800 // 7 days
});

module.exports = mongoose.model('SystemHealth', systemHealthSchema);