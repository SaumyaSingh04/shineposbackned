const Settings = require('../models/Settings');

// Default plan limits
const DEFAULT_PLAN_LIMITS = {
  trial: { orders: 5, users: 2, menuItems: 5 },
  basic: { orders: 500, users: 5, menuItems: 50 },
  premium: { orders: 2000, users: 15, menuItems: 200 },
  enterprise: { orders: 10000, users: 50, menuItems: 1000 }
};

const getPlanLimits = async (req, res) => {
  try {
    const limits = {};
    
    for (const plan of ['trial', 'basic', 'premium', 'enterprise']) {
      const orderLimit = await Settings.findOne({ key: `PLAN_${plan.toUpperCase()}_ORDERS` });
      const userLimit = await Settings.findOne({ key: `PLAN_${plan.toUpperCase()}_USERS` });
      const menuLimit = await Settings.findOne({ key: `PLAN_${plan.toUpperCase()}_MENU_ITEMS` });
      
      limits[plan] = {
        orders: orderLimit?.value || DEFAULT_PLAN_LIMITS[plan].orders,
        users: userLimit?.value || DEFAULT_PLAN_LIMITS[plan].users,
        menuItems: menuLimit?.value || DEFAULT_PLAN_LIMITS[plan].menuItems
      };
    }
    
    res.json({ limits });
  } catch (error) {
    console.error('Get plan limits error:', error);
    res.status(500).json({ error: 'Failed to fetch plan limits' });
  }
};

const updatePlanLimits = async (req, res) => {
  try {
    const { plan, limits } = req.body;
    
    if (!['trial', 'basic', 'premium', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }
    
    const updates = [];
    
    if (limits.orders !== undefined) {
      updates.push({
        key: `PLAN_${plan.toUpperCase()}_ORDERS`,
        value: parseInt(limits.orders),
        category: 'PLAN_LIMITS',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan order limit`
      });
    }
    
    if (limits.users !== undefined) {
      updates.push({
        key: `PLAN_${plan.toUpperCase()}_USERS`,
        value: parseInt(limits.users),
        category: 'PLAN_LIMITS',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan user limit`
      });
    }
    
    if (limits.menuItems !== undefined) {
      updates.push({
        key: `PLAN_${plan.toUpperCase()}_MENU_ITEMS`,
        value: parseInt(limits.menuItems),
        category: 'PLAN_LIMITS',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan menu items limit`
      });
    }
    
    for (const update of updates) {
      await Settings.findOneAndUpdate(
        { key: update.key },
        { ...update, updatedBy: req.user.userId, updatedAt: new Date() },
        { upsert: true }
      );
    }
    
    res.json({ message: 'Plan limits updated successfully' });
  } catch (error) {
    console.error('Update plan limits error:', error);
    res.status(500).json({ error: 'Failed to update plan limits' });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find().sort({ category: 1, key: 1 });
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({ settings: groupedSettings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { 
        value, 
        category: category || 'GENERAL',
        description,
        updatedBy: req.user.userId,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ message: 'Setting updated successfully', setting });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await Settings.findOneAndDelete({ key });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
};

const initializeDefaultSettings = async () => {
  const defaultSettings = [
    { key: 'APP_NAME', value: 'Restaurant SaaS', category: 'SYSTEM', description: 'Application name' },
    { key: 'MAINTENANCE_MODE', value: false, category: 'SYSTEM', description: 'Enable maintenance mode' },
    { key: 'MAX_RESTAURANTS', value: 1000, category: 'SYSTEM', description: 'Maximum number of restaurants' },
    { key: 'TRIAL_DAYS', value: 30, category: 'SYSTEM', description: 'Trial period in days' },
    { key: 'SMTP_HOST', value: '', category: 'EMAIL', description: 'SMTP server host' },
    { key: 'SMTP_PORT', value: 587, category: 'EMAIL', description: 'SMTP server port' },
    { key: 'SMTP_USER', value: '', category: 'EMAIL', description: 'SMTP username' },
    { key: 'SUPPORT_EMAIL', value: 'support@restaurantsaas.com', category: 'EMAIL', description: 'Support email address' },
    { key: 'STRIPE_ENABLED', value: false, category: 'PAYMENT', description: 'Enable Stripe payments' },
    { key: 'PAYPAL_ENABLED', value: false, category: 'PAYMENT', description: 'Enable PayPal payments' },
    { key: 'SESSION_TIMEOUT', value: 24, category: 'SECURITY', description: 'Session timeout in hours' },
    { key: 'PASSWORD_MIN_LENGTH', value: 6, category: 'SECURITY', description: 'Minimum password length' },
    // Plan limits
    { key: 'PLAN_TRIAL_ORDERS', value: 5, category: 'PLAN_LIMITS', description: 'Trial plan order limit' },
    { key: 'PLAN_TRIAL_USERS', value: 2, category: 'PLAN_LIMITS', description: 'Trial plan user limit' },
    { key: 'PLAN_TRIAL_MENU_ITEMS', value: 5, category: 'PLAN_LIMITS', description: 'Trial plan menu items limit' },
    { key: 'PLAN_BASIC_ORDERS', value: 500, category: 'PLAN_LIMITS', description: 'Basic plan order limit' },
    { key: 'PLAN_BASIC_USERS', value: 5, category: 'PLAN_LIMITS', description: 'Basic plan user limit' },
    { key: 'PLAN_BASIC_MENU_ITEMS', value: 50, category: 'PLAN_LIMITS', description: 'Basic plan menu items limit' },
    { key: 'PLAN_PREMIUM_ORDERS', value: 2000, category: 'PLAN_LIMITS', description: 'Premium plan order limit' },
    { key: 'PLAN_PREMIUM_USERS', value: 15, category: 'PLAN_LIMITS', description: 'Premium plan user limit' },
    { key: 'PLAN_PREMIUM_MENU_ITEMS', value: 200, category: 'PLAN_LIMITS', description: 'Premium plan menu items limit' },
    { key: 'PLAN_ENTERPRISE_ORDERS', value: 10000, category: 'PLAN_LIMITS', description: 'Enterprise plan order limit' },
    { key: 'PLAN_ENTERPRISE_USERS', value: 50, category: 'PLAN_LIMITS', description: 'Enterprise plan user limit' },
    { key: 'PLAN_ENTERPRISE_MENU_ITEMS', value: 1000, category: 'PLAN_LIMITS', description: 'Enterprise plan menu items limit' }
  ];

  for (const setting of defaultSettings) {
    const existing = await Settings.findOne({ key: setting.key });
    if (!existing) {
      await Settings.create(setting);
    }
  }
};

module.exports = {
  getSettings,
  updateSetting,
  deleteSetting,
  getPlanLimits,
  updatePlanLimits,
  initializeDefaultSettings
};