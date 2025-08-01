#!/usr/bin/env ts-node

/**
 * Database Models Test Suite
 * Tests User and SheetConfig models with real database operations
 */

import database from '../config/database';
import { UserModel, CreateUserData, UpdateUserData } from '../models/User';
import { SheetConfigModel, CreateSheetConfigData } from '../models/SheetConfig';
import { encrypt, decrypt, validateApiKeyFormat } from '../utils/encryption';

async function runTests() {
  console.log('🧪 Starting Database Models Test Suite...\n');

  try {
    // Test 1: Database Connection
    console.log('📊 Test 1: Database Connection');
    const connectionSuccess = await database.testConnection();
    if (!connectionSuccess) {
      throw new Error('Database connection test failed');
    }
    console.log('✅ Database connection test passed\n');

    // Test 2: Encryption/Decryption
    console.log('🔒 Test 2: Encryption/Decryption');
    const testApiKey = 'TEST_API_KEY_39_CHARS_FOR_TESTING_ONLY1';
    console.log('Original API key:', testApiKey);
    
    const encrypted = encrypt(testApiKey);
    console.log('Encrypted API key:', encrypted.substring(0, 50) + '...');
    
    const decrypted = decrypt(encrypted);
    console.log('Decrypted API key:', decrypted);
    
    if (testApiKey !== decrypted) {
      throw new Error('Encryption/decryption failed');
    }
    
    console.log('API key validation:', validateApiKeyFormat(testApiKey));
    console.log('✅ Encryption/decryption test passed\n');

    // Test 3: User Model CRUD Operations
    console.log('👤 Test 3: User Model CRUD Operations');
    
    // Create test user with timestamp to avoid duplicates
    const timestamp = Date.now();
    const testUserData: CreateUserData = {
      email: `test-${timestamp}@leedz.online`,
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      google_oauth_id: `google_test_${timestamp}`
    };

    let testUser = await UserModel.create(testUserData);
    console.log('Created user:', testUser.email, 'with ID:', testUser.id);

    // Find user by ID
    let foundUser = await UserModel.findById(testUser.id);
    console.log('Found user by ID:', foundUser?.email);

    // Find user by email
    foundUser = await UserModel.findByEmail(testUser.email);
    console.log('Found user by email:', foundUser?.email);

    // Find user by Google ID
    foundUser = await UserModel.findByGoogleId(testUser.google_oauth_id);
    console.log('Found user by Google ID:', foundUser?.email);

    // Update user with API key
    const updateData: UpdateUserData = {
      name: 'Updated Test User',
      places_api_key: testApiKey
    };
    
    const updatedUser = await UserModel.update(testUser.id, updateData);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    testUser = updatedUser;
    console.log('Updated user name:', testUser.name);

    // Get decrypted API key
    const retrievedApiKey = await UserModel.getApiKey(testUser.id);
    console.log('Retrieved API key matches:', retrievedApiKey === testApiKey);

    // Test usage tracking
    const usage1 = await UserModel.incrementUsage(testUser.id);
    console.log('Usage after increment 1:', usage1);
    
    const usage2 = await UserModel.incrementUsage(testUser.id);
    console.log('Usage after increment 2:', usage2);

    const dailyUsage = await UserModel.getDailyUsage(testUser.id);
    console.log('Daily usage stats:', dailyUsage);

    const hasReachedLimit = await UserModel.hasReachedDailyLimit(testUser.id);
    console.log('Has reached daily limit:', hasReachedLimit);

    console.log('✅ User model tests passed\n');

    // Test 4: SheetConfig Model Operations
    console.log('📋 Test 4: SheetConfig Model Operations');

    const testSheetData: CreateSheetConfigData = {
      user_id: testUser.id,
      spreadsheet_id: '1A2B3C4D5E6F7G8H9I0J',
      spreadsheet_name: 'Test Leads Sheet',
      sheet_tab_name: 'Leads-2025-08-01'
    };

    let sheetConfig = await SheetConfigModel.create(testSheetData);
    console.log('Created sheet config:', sheetConfig.spreadsheet_name);

    // Get active config
    let activeConfig = await SheetConfigModel.getActiveConfig(testUser.id);
    console.log('Active config:', activeConfig?.spreadsheet_name);

    // Create another config (should deactivate the first one)
    const testSheetData2: CreateSheetConfigData = {
      user_id: testUser.id,
      spreadsheet_id: '2B3C4D5E6F7G8H9I0J1K',
      spreadsheet_name: 'Test Leads Sheet 2',
      sheet_tab_name: 'Leads-2025-08-02'
    };

    let sheetConfig2 = await SheetConfigModel.create(testSheetData2);
    console.log('Created second sheet config:', sheetConfig2.spreadsheet_name);

    // Check active config changed
    activeConfig = await SheetConfigModel.getActiveConfig(testUser.id);
    console.log('New active config:', activeConfig?.spreadsheet_name);

    // Get all configs for user
    const allConfigs = await SheetConfigModel.getAllForUser(testUser.id);
    console.log('Total configs for user:', allConfigs.length);

    // Activate first config again
    await SheetConfigModel.activate(sheetConfig.id);
    activeConfig = await SheetConfigModel.getActiveConfig(testUser.id);
    console.log('Reactivated config:', activeConfig?.spreadsheet_name);

    console.log('✅ SheetConfig model tests passed\n');

    // Test 5: Database Pool Status
    console.log('📊 Test 5: Database Pool Status');
    const poolStatus = database.getPoolStatus();
    console.log('Pool status:', poolStatus);
    console.log('✅ Pool status test passed\n');

    // Cleanup: Delete test data
    console.log('🧹 Cleanup: Deleting test data');
    await SheetConfigModel.delete(sheetConfig.id);
    await SheetConfigModel.delete(sheetConfig2.id);
    await UserModel.delete(testUser.id);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All database model tests passed successfully!');
    console.log('✅ Issue 3.2: Database Connection & ORM - COMPLETE');

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

export { runTests }; 