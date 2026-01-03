const createMenu = async (req, res) => {
  try {
    // Check if restaurant is on trial and has reached limit
    const restaurantSlug = req.user.restaurantSlug;
    const Restaurant = require('../models/Restaurant');
    const Settings = require('../models/Settings');
    
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    if (!req.tenantModels || !req.tenantModels.Menu) {
      return res.status(500).json({ error: 'Restaurant database not found' });
    }
    
    const MenuModel = req.tenantModels.Menu;
    
    // Get dynamic menu item limit from settings
    const menuLimitSetting = await Settings.findOne({ 
      key: `PLAN_${restaurant.subscriptionPlan.toUpperCase()}_MENU_ITEMS` 
    });
    const menuLimit = menuLimitSetting?.value || (restaurant.subscriptionPlan === 'trial' ? 5 : 50);
    
    // Check menu item limit
    const menuCount = await MenuModel.countDocuments();
    if (menuCount >= menuLimit) {
      return res.status(403).json({ 
        error: `${restaurant.subscriptionPlan.charAt(0).toUpperCase() + restaurant.subscriptionPlan.slice(1)} accounts are limited to ${menuLimit} menu items. Please upgrade to add more.` 
      });
    }

    const { name, description, price, category } = req.body;

    const menuItem = new MenuModel({
      name,
      description,
      price: parseFloat(price),
      category,
      isAvailable: true
    });

    await menuItem.save();
    res.status(201).json({ message: 'Menu item created successfully', menuItem });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ error: 'Failed to create menu item', details: error.message });
  }
};

const getMenus = async (req, res) => {
  try {
    const MenuModel = req.tenantModels.Menu;
    const menus = await MenuModel.find().sort({ createdAt: -1 });
    res.json({ menus });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const MenuModel = req.tenantModels.Menu;
    
    const menuItem = await MenuModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully', menuItem });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const MenuModel = req.tenantModels.Menu;
    
    const menuItem = await MenuModel.findByIdAndDelete(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

module.exports = {
  createMenu,
  getMenus,
  updateMenu,
  deleteMenu
};