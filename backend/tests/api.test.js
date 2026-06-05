const assert = require('assert');
const bcrypt = require('bcryptjs');
const User = require('../src/models/userModel');
const Product = require('../src/models/productModel');
const { connectDB } = require('../src/config/db');

const runTests = async () => {
  console.log('--- Initiating Backend Integration Tests ---');
  
  try {
    // 1. Connect
    await connectDB();

    // 2. Clear test environment
    await User.deleteMany({ email: 'test_user@example.com' });
    
    // 3. Test User Registration
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const newUser = await User.create({
      name: 'Testy Tester',
      email: 'test_user@example.com',
      password: passwordHash,
      isAdmin: false
    });
    
    assert.ok(newUser._id, 'User ID should be generated');
    assert.strictEqual(newUser.name, 'Testy Tester', 'Name should match');
    console.log('✓ User creation test passed');

    // 4. Test User Lookup
    const foundUser = await User.findOne({ email: 'test_user@example.com' });
    assert.ok(foundUser, 'User should be found in DB');
    assert.strictEqual(foundUser.email, 'test_user@example.com', 'Email should match');
    console.log('✓ User lookup test passed');

    // 5. Test Password Verification
    const passwordMatches = await bcrypt.compare('password123', foundUser.password);
    assert.strictEqual(passwordMatches, true, 'Passwords should match hash');
    console.log('✓ Password hashing/comparison test passed');

    // 6. Test Product Retrieval
    const products = await Product.find({});
    assert.ok(Array.isArray(products), 'Products should be an array');
    console.log(`✓ Product find test passed (found ${products.length} products)`);

    // Clean up
    await User.deleteMany({ email: 'test_user@example.com' });
    console.log('✓ Clean-up successful');
    console.log('--- All Tests Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Test Suite Failed:', error.message);
    process.exit(1);
  }
};

runTests();
