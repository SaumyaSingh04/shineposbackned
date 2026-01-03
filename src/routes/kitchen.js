const express = require('express');
const { 
  getKitchenOrders, 
  updateOrderStatus, 
  setPriority 
} = require('../controllers/kitchenController');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

const router = express.Router();

// Get kitchen orders
router.get('/orders', auth(['KITCHEN_STAFF', 'MANAGER', 'RESTAURANT_ADMIN']), tenantMiddleware, getKitchenOrders);

// Update order status
router.patch('/orders/:id/status', auth(['KITCHEN_STAFF', 'MANAGER', 'RESTAURANT_ADMIN']), tenantMiddleware, updateOrderStatus);

// Set order priority
router.patch('/orders/:id/priority', auth(['MANAGER', 'RESTAURANT_ADMIN']), tenantMiddleware, setPriority);

module.exports = router;