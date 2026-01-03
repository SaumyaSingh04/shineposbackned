const express = require('express');
const { getAllBilling, updatePlan } = require('../controllers/billingController');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all billing (Super Admin only)
router.get('/', auth(['SUPER_ADMIN']), getAllBilling);

// Update plan (Super Admin only)
router.put('/:restaurantId/plan', auth(['SUPER_ADMIN']), updatePlan);

// Extend trial (Super Admin only)
router.put('/:restaurantId/trial', auth(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { subscriptionPlan: 'trial' },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({ message: 'Trial extended successfully', restaurant });
  } catch (error) {
    console.error('Trial extension error:', error);
    res.status(500).json({ error: 'Failed to extend trial' });
  }
});

module.exports = router;