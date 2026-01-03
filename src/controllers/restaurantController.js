const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const Subscription = require('../models/Subscription');
const TenantModelFactory = require('../models/TenantModelFactory');
const { generateToken } = require('../utils/jwt');

const createRestaurant = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    console.log('Request body:', req.body);
    const { name, adminEmail, adminPassword, adminName, phone, address, city, state, zipCode, cuisine, description } = req.body;
    
    console.log('Extracted data:', { name, adminEmail, adminName });
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    console.log('Generated slug:', slug);
    
    // Check if restaurant already exists
    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      return res.status(400).json({ error: 'Restaurant with this name already exists' });
    }

    // Create restaurant
    const restaurant = new Restaurant({ 
      name, 
      slug, 
      adminEmail, 
      adminName,
      phone,
      address,
      city,
      state,
      zipCode,
      cuisine,
      description
    });
    await restaurant.save();
    console.log('Restaurant saved successfully');

    // Check if admin email already exists across all restaurants
    const restaurants = await Restaurant.find();
    let emailExists = false;
    
    for (const existingRestaurant of restaurants) {
      try {
        const ExistingUserModel = TenantModelFactory.getUserModel(existingRestaurant.slug);
        const existingUser = await ExistingUserModel.findOne({ email: adminEmail });
        if (existingUser) {
          emailExists = true;
          console.log(`Email ${adminEmail} found in restaurant: ${existingRestaurant.slug}`);
          break;
        }
      } catch (err) {
        // Skip if restaurant database doesn't exist yet
        console.log(`Skipping restaurant ${existingRestaurant.slug} - database not accessible:`, err.message);
        continue;
      }
    }
    
    if (emailExists) {
      return res.status(400).json({ error: 'Admin email already exists in another restaurant' });
    }

    // Create restaurant admin user
    console.log('Creating admin user...');
    const UserModel = TenantModelFactory.getUserModel(slug);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = new UserModel({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'RESTAURANT_ADMIN'
    });
    await adminUser.save();

    // Create subscription with trial
    const subscription = new Subscription({
      restaurantId: restaurant._id,
      plan: 'trial',
      billing: 'monthly',
      price: 0,
      status: 'trial',
      limits: {
        orders: 5,
        storage: 500,
        users: 2
      }
    });
    await subscription.save();

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        adminEmail: restaurant.adminEmail,
        adminName: restaurant.adminName,
        phone: restaurant.phone,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        zipCode: restaurant.zipCode,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        isActive: restaurant.isActive
      }
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create restaurant', details: error.message });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json({ restaurants });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

const getRestaurantAnalytics = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    const analytics = [];

    for (const restaurant of restaurants) {
      try {
        const OrderModel = TenantModelFactory.getOrderModel(restaurant.slug);
        const MenuModel = TenantModelFactory.getMenuModel(restaurant.slug);
        
        const totalOrders = await OrderModel.countDocuments();
        const totalRevenue = await OrderModel.aggregate([
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const menuCount = await MenuModel.countDocuments();
        
        analytics.push({
          restaurantId: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          isActive: restaurant.isActive,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          menuCount
        });
      } catch (err) {
        analytics.push({
          restaurantId: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          isActive: restaurant.isActive,
          totalOrders: 0,
          totalRevenue: 0,
          menuCount: 0
        });
      }
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      id, 
      { name }, 
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
};

const toggleRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();

    res.json({
      message: `Restaurant ${restaurant.isActive ? 'enabled' : 'disabled'} successfully`,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        isActive: restaurant.isActive
      }
    });
  } catch (error) {
    console.error('Toggle restaurant status error:', error);
    res.status(500).json({ error: 'Failed to update restaurant status' });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantAnalytics,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus
};