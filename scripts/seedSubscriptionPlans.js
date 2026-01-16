require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');

const plans = [
  {
    name: 'standard',
    displayName: 'Standard Plan',
    price: 1500,
    duration: 30,
    features: [
      'Unlimited orders',
      'Unlimited staff members',
      'Unlimited menu items',
      'Full POS system access',
      'Kitchen display system',
      'Order management',
      'Staff management',
      'Analytics & reports',
      'Email support'
    ],
    limits: {
      orders: -1,
      users: -1,
      menuItems: -1
    }
  }
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing plans');

    // Insert new plans
    await SubscriptionPlan.insertMany(plans);
    console.log('Subscription plans seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
