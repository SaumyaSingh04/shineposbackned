const Restaurant = require('../models/Restaurant');
const Settings = require('../models/Settings');
const TenantModelFactory = require('../models/TenantModelFactory');

// Get dynamic plan limits from settings
const getPlanLimitsFromSettings = async () => {
  const limits = {};
  
  for (const plan of ['trial', 'basic', 'premium', 'enterprise']) {
    const orderLimit = await Settings.findOne({ key: `PLAN_${plan.toUpperCase()}_ORDERS` });
    const userLimit = await Settings.findOne({ key: `PLAN_${plan.toUpperCase()}_USERS` });
    const menuLimit = await Settings.findOne({ key: `PLAN_${plan.toUpperCase()}_MENU_ITEMS` });
    
    limits[plan] = {
      orders: orderLimit?.value || (plan === 'trial' ? 5 : plan === 'basic' ? 500 : plan === 'premium' ? 2000 : 10000),
      users: userLimit?.value || (plan === 'trial' ? 2 : plan === 'basic' ? 5 : plan === 'premium' ? 15 : 50),
      menuItems: menuLimit?.value || (plan === 'trial' ? 5 : plan === 'basic' ? 50 : plan === 'premium' ? 200 : 1000)
    };
  }
  
  return limits;
};

const trackUsage = async (req, res, next) => {
  try {
    // Only track for restaurant operations
    if (!req.user || !req.user.restaurantSlug) {
      return next();
    }

    const restaurantSlug = req.user.restaurantSlug;
    
    // Find restaurant
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      return next();
    }

    // Check if restaurant is active
    if (!restaurant.isActive) {
      return res.status(403).json({ error: 'Account is suspended. Please contact support.' });
    }

    // Add restaurant info to request
    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Usage tracking error:', error);
    next(); // Continue on error to avoid breaking the app
  }
};

const checkSubscriptionLimits = async (restaurantSlug) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) return null;

    // Get dynamic limits from settings
    const planLimits = await getPlanLimitsFromSettings();
    const limits = planLimits[restaurant.subscriptionPlan] || planLimits.trial;
    
    // Get current usage
    const OrderModel = TenantModelFactory.getOrderModel(restaurantSlug);
    const UserModel = TenantModelFactory.getUserModel(restaurantSlug);
    const MenuModel = TenantModelFactory.getMenuModel(restaurantSlug);
    
    const orderCount = await OrderModel.countDocuments();
    const userCount = await UserModel.countDocuments();
    const menuCount = await MenuModel.countDocuments();

    return {
      restaurant,
      usage: { orders: orderCount, users: userCount, menuItems: menuCount },
      limits,
      overLimits: {
        orders: orderCount > limits.orders,
        users: userCount > limits.users,
        menuItems: menuCount > limits.menuItems
      }
    };
  } catch (error) {
    console.error('Check subscription limits error:', error);
    return null;
  }
};

module.exports = {
  trackUsage,
  checkSubscriptionLimits,
  getPlanLimitsFromSettings
};