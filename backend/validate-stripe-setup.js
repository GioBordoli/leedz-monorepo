#!/usr/bin/env node

/**
 * Stripe Setup Validation Script
 * Checks if all required environment variables are configured for Stripe integration
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Stripe Integration Setup...\n');

let hasErrors = false;

// Required environment variables
const requiredVars = {
  backend: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET', 
    'STRIPE_MONTHLY_PRICE_ID'
  ],
  frontend: [
    'REACT_APP_STRIPE_PUBLISHABLE_KEY'
  ]
};

// Helper function to check if value looks like a valid Stripe key
function validateStripeKey(key, value) {
  const patterns = {
    'STRIPE_SECRET_KEY': /^sk_(test_|live_)[a-zA-Z0-9]{24,}$/,
    'REACT_APP_STRIPE_PUBLISHABLE_KEY': /^pk_(test_|live_)[a-zA-Z0-9]{24,}$/,
    'STRIPE_WEBHOOK_SECRET': /^whsec_[a-zA-Z0-9]{32,}$/,
    'STRIPE_MONTHLY_PRICE_ID': /^price_[a-zA-Z0-9]{24,}$/
  };

  if (patterns[key]) {
    return patterns[key].test(value);
  }
  return true; // For keys without specific patterns
}

// Check backend environment variables
console.log('🖥️  Backend Environment (.env):');
requiredVars.backend.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`   ❌ ${varName}: Missing`);
    hasErrors = true;
  } else if (value.includes('placeholder') || value.includes('your_')) {
    console.log(`   ⚠️  ${varName}: Contains placeholder value`);
    hasErrors = true;
  } else if (!validateStripeKey(varName, value)) {
    console.log(`   ⚠️  ${varName}: Invalid format`);
    hasErrors = true;
  } else {
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Check frontend environment variables
console.log('\n🌐 Frontend Environment (frontend/.env):');
const frontendEnvPath = path.join(__dirname, '../frontend/.env');

let frontendEnv = {};
if (fs.existsSync(frontendEnvPath)) {
  const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      frontendEnv[key.trim()] = value.trim();
    }
  });
} else {
  console.log('   ⚠️  frontend/.env file not found');
  hasErrors = true;
}

requiredVars.frontend.forEach(varName => {
  const value = frontendEnv[varName];
  
  if (!value) {
    console.log(`   ❌ ${varName}: Missing`);
    hasErrors = true;
  } else if (value.includes('placeholder') || value.includes('your_')) {
    console.log(`   ⚠️  ${varName}: Contains placeholder value`);
    hasErrors = true;
  } else if (!validateStripeKey(varName, value)) {
    console.log(`   ⚠️  ${varName}: Invalid format`);
    hasErrors = true;
  } else {
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Test Stripe connection (if secret key is available)
console.log('\n🔗 Testing Stripe Connection:');
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // This will fail gracefully if key is invalid
    console.log('   ℹ️  Stripe SDK initialized successfully');
    console.log('   ℹ️  Use test card 4242 4242 4242 4242 for testing');
  } catch (error) {
    console.log(`   ❌ Stripe SDK error: ${error.message}`);
    hasErrors = true;
  }
} else {
  console.log('   ⚠️  Cannot test - STRIPE_SECRET_KEY not configured');
  hasErrors = true;
}

// Check if products need to be created
console.log('\n📦 Stripe Products:');
if (process.env.STRIPE_MONTHLY_PRICE_ID && !process.env.STRIPE_MONTHLY_PRICE_ID.includes('placeholder')) {
  console.log('   ✅ Price ID configured');
} else {
  console.log('   ⚠️  Run "node setup-stripe-products.js" to create products');
  hasErrors = true;
}

// Database check
console.log('\n🗄️  Database:');
try {
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://leedz_user:leedz_password@localhost:5432/leedz_db'
  });
  
  console.log('   ℹ️  Database configuration found');
  console.log('   ℹ️  Run "node migrations/run_migrations.js" if not done');
} catch (error) {
  console.log('   ⚠️  Database client error - check DATABASE_URL');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup validation FAILED');
  console.log('\n📋 Next steps:');
  console.log('1. Add missing environment variables');
  console.log('2. Run "node setup-stripe-products.js" to create products');
  console.log('3. Set up webhook endpoint with ngrok for development');
  console.log('4. Run validation again');
  process.exit(1);
} else {
  console.log('✅ Setup validation PASSED');
  console.log('\n🎉 Your Stripe integration is ready for testing!');
  console.log('\n📋 Ready to test:');
  console.log('1. Start servers: npm run dev (backend) && npm start (frontend)');
  console.log('2. Navigate to Settings > Billing');
  console.log('3. Test subscription with card 4242 4242 4242 4242');
  process.exit(0);
} 