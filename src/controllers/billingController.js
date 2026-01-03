const Restaurant = require('../models/Restaurant');

const PLANS = {
  trial: { price: 0, features: ['2 users', '5 orders/month', 'Basic support'] },
  basic: { price: 29, features: ['5 users', '500 orders/month', 'Basic support'] },
  premium: { price: 79, features: ['15 users', '2000 orders/month', 'Priority support'] },
  enterprise: { price: 199, features: ['50 users', 'Unlimited orders', '24/7 support'] }
};

const getAllBilling = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    
    const billings = restaurants.map(restaurant => ({
      _id: restaurant._id,
      restaurantId: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug
      },
      plan: restaurant.subscriptionPlan || 'trial',
      monthlyPrice: PLANS[restaurant.subscriptionPlan || 'trial'].price,
      status: 'ACTIVE',
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trialEnd: restaurant.subscriptionPlan === 'trial' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    }));
    
    res.json({ billings, plans: PLANS });
  } catch (error) {
    console.error('Get all billing error:', error);
    res.status(500).json({ error: 'Failed to fetch billing data' });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { subscriptionPlan: plan },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Plan updated successfully', restaurant });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

module.exports = {
  getAllBilling,
  updatePlan
};