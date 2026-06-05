const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const { connectDB } = require('./db');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const seedData = async () => {
  try {
    // Connect to DB (MongoDB or Local FileDB)
    await connectDB();

    // Clear existing data
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log('Database cleared.');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true
    });

    const normalUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      isAdmin: false
    });

    console.log('Users seeded successfully.');

    // Seed Products
    const products = [
      {
        name: 'Aether Quantum Noise-Canceling Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
        description: 'Immerse yourself in pure auditory bliss. Experience industry-leading active noise cancelation, 40-hour battery life, high-res audio spatial sound, and custom-tuned transducers built for the discerning audiophile.',
        brand: 'Aether Systems',
        category: 'Electronics',
        price: 299.99,
        countInStock: 15,
        rating: 4.8,
        numReviews: 24
      },
      {
        name: 'Zephyr Mechanical Ergonomic Keyboard',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
        description: 'A masterpiece of form and tactile precision. The Zephyr features hot-swappable tactile violet switches, dynamic per-key RGB backlighting, custom aviation cable, and a heavy solid aluminum housing.',
        brand: 'KeebCraft',
        category: 'Electronics',
        price: 189.50,
        countInStock: 8,
        rating: 4.9,
        numReviews: 12
      },
      {
        name: 'Chronos Carbon Chronograph Watch',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
        description: 'A visual statement of elegance and resilience. Built with an aerospace-grade carbon fiber casing, custom automatic self-winding movement, Sapphire crystal cover, and double-stitched leather strap.',
        brand: 'Chronos',
        category: 'Accessories',
        price: 450.00,
        countInStock: 5,
        rating: 4.7,
        numReviews: 8
      },
      {
        name: 'Atlas Minimalist Modular Backpack',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
        description: 'Designed for the modern tech nomad. The Atlas backpack is weather-proof, features modular storage pouches, quick-access card slots, a TSA-friendly padded laptop pocket, and premium magnetic buckles.',
        brand: 'Atlas Goods',
        category: 'Accessories',
        price: 135.00,
        countInStock: 20,
        rating: 4.6,
        numReviews: 35
      },
      {
        name: 'Lumina Smart Ambient Lamp',
        image: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=800&auto=format&fit=crop&q=60',
        description: 'Transform your room atmosphere instantly. Offers 16 million colors, automated circadian lighting cycles, direct integration with smart assistants, and a beautiful sleek brushed brass base with glass cover.',
        brand: 'Lumina',
        category: 'Home Decors',
        price: 79.99,
        countInStock: 12,
        rating: 4.5,
        numReviews: 19
      },
      {
        name: 'VoltX 100W GaN Travel Charger',
        image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=60',
        description: 'The ultimate charging hub in a pocket-sized package. Power up 3 devices simultaneously with two USB-C PD ports and one USB-A port using ultra-efficient Gallium Nitride (GaN) technology.',
        brand: 'VoltX',
        category: 'Electronics',
        price: 49.99,
        countInStock: 25,
        rating: 4.7,
        numReviews: 42
      }
    ];

    for (let p of products) {
      await Product.create(p);
    }

    console.log('Products seeded successfully.');
    console.log('Database seeding finished. Exiting script.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
