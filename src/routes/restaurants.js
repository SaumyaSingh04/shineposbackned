const express = require('express');
const { body } = require('express-validator');
const { createRestaurant, getRestaurants, getRestaurantAnalytics, updateRestaurant, deleteRestaurant, toggleRestaurantStatus } = require('../controllers/restaurantController');
const auth = require('../middleware/auth');

const router = express.Router();

// Create restaurant (Super Admin only)
router.post('/', 
  auth(['SUPER_ADMIN']),
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Restaurant name must be at least 2 characters'),
    body('adminEmail').isEmail().withMessage('Valid admin email is required'),
    body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
    body('adminName').trim().isLength({ min: 2 }).withMessage('Admin name must be at least 2 characters')
  ],
  createRestaurant
);

// Get all restaurants (Super Admin only)
router.get('/', auth(['SUPER_ADMIN']), getRestaurants);

// Get restaurant analytics (Super Admin only)
router.get('/analytics', auth(['SUPER_ADMIN']), getRestaurantAnalytics);

// Update restaurant (Super Admin only)
router.put('/:id', auth(['SUPER_ADMIN']), updateRestaurant);

// Delete restaurant (Super Admin only)
router.delete('/:id', auth(['SUPER_ADMIN']), deleteRestaurant);

// Toggle restaurant status (Super Admin only)
router.patch('/:id/toggle-status', auth(['SUPER_ADMIN']), toggleRestaurantStatus);

module.exports = router;