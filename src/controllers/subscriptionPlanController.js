const Restaurant = require('../models/Restaurant');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// Get all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

// Subscribe to a plan
const subscribeToPlan = async (req, res) => {
  try {
    const { restaurantId, planName, paymentMethod, transactionId } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const plan = await SubscriptionPlan.findOne({ name: planName, isActive: true });
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    restaurant.subscriptionPlan = planName;
    restaurant.subscriptionStartDate = startDate;
    restaurant.subscriptionEndDate = endDate;
    restaurant.paymentStatus = 'paid';
    restaurant.paymentHistory.push({
      planName: plan.displayName,
      amount: plan.price,
      paymentMethod,
      transactionId,
      status: 'paid',
      paidAt: new Date()
    });

    await restaurant.save();

    res.json({ 
      message: 'Subscription activated successfully',
      subscription: {
        plan: planName,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
};

// Get restaurant subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const now = new Date();
    const isExpired = restaurant.subscriptionEndDate && new Date(restaurant.subscriptionEndDate) < now;

    res.json({
      subscription: {
        plan: restaurant.subscriptionPlan,
        startDate: restaurant.subscriptionStartDate,
        endDate: restaurant.subscriptionEndDate,
        paymentStatus: restaurant.paymentStatus,
        isExpired,
        daysRemaining: restaurant.subscriptionEndDate 
          ? Math.ceil((new Date(restaurant.subscriptionEndDate) - now) / (1000 * 60 * 60 * 24))
          : 0
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
};

module.exports = {
  getSubscriptionPlans,
  subscribeToPlan,
  getSubscriptionStatus
};
