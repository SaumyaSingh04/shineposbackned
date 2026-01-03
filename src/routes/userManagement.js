const express = require('express');
const { body } = require('express-validator');
const { getAllUsers, getRestaurantUsers, createUser, updateUser, deleteUser } = require('../controllers/userManagementController');
const auth = require('../middleware/auth');

const router = express.Router();

// All user management routes require super admin access
router.use(auth(['SUPER_ADMIN']));

// Get all users across all restaurants
router.get('/', getAllUsers);

// Get users for specific restaurant
router.get('/restaurant/:restaurantId', getRestaurantUsers);

// Create user for restaurant
router.post('/restaurant/:restaurantId', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').isIn(['RESTAURANT_ADMIN', 'STAFF']).withMessage('Invalid role')
], createUser);

// Update user
router.put('/restaurant/:restaurantId/user/:userId', updateUser);

// Delete user
router.delete('/restaurant/:restaurantId/user/:userId', deleteUser);

module.exports = router;