const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Service = require('../models/Service');

/**
 * Seed script — Creates initial ADMIN user and sample data.
 * Run with: npm run seed
 */
const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/serveconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    // Create ADMIN user
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@serveconnect.com',
        password: 'admin123',
        role: 'ADMIN',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
      });
      console.log('✅ Admin user created: admin@serveconnect.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample provider
    const providerExists = await User.findOne({ email: 'provider@test.com' });
    if (!providerExists) {
      const provider = await User.create({
        name: 'John Provider',
        email: 'provider@test.com',
        password: 'password123',
        role: 'PROVIDER',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      });

      // Create sample services
      await Service.insertMany([
        {
          title: 'Professional Plumbing Service',
          description: 'Expert plumbing repairs, installations, and maintenance. Available 24/7 for emergencies.',
          category: 'Plumbing',
          providerId: provider._id,
          price: 500,
          priceUnit: 'per_hour',
          location: { type: 'Point', coordinates: [77.5946, 12.9716] },
          tags: ['plumbing', 'repair', 'emergency'],
        },
        {
          title: 'Electrical Wiring & Repair',
          description: 'Complete electrical services including wiring, circuit repair, and appliance installation.',
          category: 'Electrical',
          providerId: provider._id,
          price: 600,
          priceUnit: 'per_hour',
          location: { type: 'Point', coordinates: [77.5946, 12.9716] },
          tags: ['electrical', 'wiring', 'repair'],
        },
        {
          title: 'Deep Home Cleaning',
          description: 'Thorough deep cleaning service for homes and apartments. Eco-friendly products used.',
          category: 'Cleaning',
          providerId: provider._id,
          price: 1500,
          priceUnit: 'fixed',
          location: { type: 'Point', coordinates: [77.5946, 12.9716] },
          tags: ['cleaning', 'deep-clean', 'eco-friendly'],
        },
      ]);
      console.log('✅ Sample provider and services created');
    } else {
      console.log('ℹ️  Sample data already exists');
    }

    // Create sample user
    const userExists = await User.findOne({ email: 'user@test.com' });
    if (!userExists) {
      await User.create({
        name: 'Jane User',
        email: 'user@test.com',
        password: 'password123',
        role: 'USER',
        location: { type: 'Point', coordinates: [77.6000, 12.9750] },
      });
      console.log('✅ Sample user created: user@test.com / password123');
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
