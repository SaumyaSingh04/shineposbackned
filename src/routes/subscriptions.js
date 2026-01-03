const express = require('express');
const { body } = require('express-validator');
const {
  createSubscription,
  getSubscriptions,
  getRestaurantSubscription,
  updateSubscription,
  updateSubscriptionLimits,
  cancelSubscription,
  reactivateSubscription,
  processPayment,
  updateUsage,
  getBillingReport,
  updatePlanConfig,
  getPlanConfigs,
  checkTrialExpiry,
  updateRestaurantPlan
} = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions (Super Admin)
router.get('/', auth(['SUPER_ADMIN']), getSubscriptions);

// Get restaurant subscription
router.get('/restaurant/:restaurantId', auth(['SUPER_ADMIN', 'RESTAURANT_ADMIN']), getRestaurantSubscription);

// Create subscription (Super Admin)
router.post('/',
  auth(['SUPER_ADMIN']),
  [
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('plan').isIn(['trial', 'basic', 'premium', 'enterprise']).withMessage('Valid plan is required')
  ],
  createSubscription
);

// Update subscription (Super Admin)
router.put('/:id', auth(['SUPER_ADMIN']), updateSubscription);

// Update subscription limits (Super Admin)
router.patch('/:id/limits', auth(['SUPER_ADMIN']), updateSubscriptionLimits);

// Cancel subscription
router.patch('/:id/cancel', auth(['SUPER_ADMIN', 'RESTAURANT_ADMIN']), cancelSubscription);

// Reactivate subscription
router.patch('/:id/reactivate', auth(['SUPER_ADMIN']), reactivateSubscription);

// Process payment
router.post('/payment',
  auth(['SUPER_ADMIN', 'RESTAURANT_ADMIN']),
  [
    body('subscriptionId').notEmpty().withMessage('Subscription ID is required')
  ],
  processPayment
);

// Update usage (Internal API)
router.patch('/usage/:restaurantId', updateUsage);

// Get billing report (Super Admin)
router.get('/reports/billing', auth(['SUPER_ADMIN']), getBillingReport);

// Plan configuration management
router.get('/plans', auth(['SUPER_ADMIN']), getPlanConfigs);
router.put('/plans/:plan', auth(['SUPER_ADMIN']), updatePlanConfig);

// Update restaurant plan (Super Admin)
router.put('/restaurant/:restaurantId/plan', auth(['SUPER_ADMIN']), updateRestaurantPlan);

// Check trial expiry (Cron job endpoint)
router.post('/check-trials', checkTrialExpiry);

module.exports = router;