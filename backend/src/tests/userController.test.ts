#!/usr/bin/env ts-node

/**
 * User Controller Integration Test Suite
 * Tests UserController endpoints with authentication and validation
 */

import database from '../config/database';
import { UserModel, CreateUserData } from '../models/User';
import UserController from '../controllers/UserController';
import { Request } from 'express';

// Mock authenticated request interface
interface MockAuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    picture?: string;
  };
}

// Mock response object for testing
class MockResponse {
  public statusCode: number = 200;
  public responseBody: any = null;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(body: any) {
    this.responseBody = body;
    return this;
  }
}

async function runUserControllerTests() {
  console.log('🧪 Starting User Controller Integration Tests...\n');

  try {
    // Verify database connection
    console.log('📊 Test Setup: Database Connection');
    const connectionSuccess = await database.testConnection();
    if (!connectionSuccess) {
      throw new Error('Database connection test failed');
    }
    console.log('✅ Database connection verified\n');

    // Create test user for authentication
    console.log('👤 Test Setup: Creating Test User');
    const timestamp = Date.now();
    const testUserData: CreateUserData = {
      email: `test-controller-${timestamp}@leedz.online`,
      name: 'Test Controller User',
      picture: 'https://example.com/avatar.jpg',
      google_oauth_id: `google_controller_test_${timestamp}`
    };

    const testUser = await UserModel.create(testUserData);
    console.log('✅ Test user created:', testUser.email, 'ID:', testUser.id);

    const userController = new UserController();

    // Test 1: Get Profile
    console.log('\n🔍 Test 1: Get User Profile');
    const getProfileReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        picture: testUser.picture
      }
    } as MockAuthenticatedRequest;

    const getProfileRes = new MockResponse() as any;
    await userController.getProfile(getProfileReq, getProfileRes);

    console.log('Response Status:', getProfileRes.statusCode);
    console.log('Profile Data:', JSON.stringify(getProfileRes.responseBody, null, 2));
    
    if (getProfileRes.statusCode !== 200 || !getProfileRes.responseBody.success) {
      throw new Error('Get profile test failed');
    }
    console.log('✅ Get profile test passed\n');

    // Test 2: Update Profile
    console.log('📝 Test 2: Update User Profile');
    const updateProfileReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      body: {
        name: 'Updated Test User',
        picture: 'https://example.com/new-avatar.jpg'
      }
    } as MockAuthenticatedRequest;

    const updateProfileRes = new MockResponse() as any;
    await userController.updateProfile(updateProfileReq, updateProfileRes);

    console.log('Response Status:', updateProfileRes.statusCode);
    console.log('Update Response:', JSON.stringify(updateProfileRes.responseBody, null, 2));
    
    if (updateProfileRes.statusCode !== 200 || !updateProfileRes.responseBody.success) {
      throw new Error('Update profile test failed');
    }
    console.log('✅ Update profile test passed\n');

    // Test 3: API Key Storage
    console.log('🔑 Test 3: Store API Key');
    const setApiKeyReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      body: {
        api_key: 'TEST_API_KEY_39_CHARS_FOR_TESTING_ONLY1'
      }
    } as MockAuthenticatedRequest;

    const setApiKeyRes = new MockResponse() as any;
    await userController.setApiKey(setApiKeyReq, setApiKeyRes);

    console.log('Response Status:', setApiKeyRes.statusCode);
    console.log('API Key Response:', JSON.stringify(setApiKeyRes.responseBody, null, 2));
    
    if (setApiKeyRes.statusCode !== 200 || !setApiKeyRes.responseBody.success) {
      throw new Error('Set API key test failed');
    }
    console.log('✅ API key storage test passed\n');

    // Test 4: API Key Status
    console.log('🔍 Test 4: Get API Key Status');
    const getApiKeyStatusReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      }
    } as MockAuthenticatedRequest;

    const getApiKeyStatusRes = new MockResponse() as any;
    await userController.getApiKeyStatus(getApiKeyStatusReq, getApiKeyStatusRes);

    console.log('Response Status:', getApiKeyStatusRes.statusCode);
    console.log('API Key Status:', JSON.stringify(getApiKeyStatusRes.responseBody, null, 2));
    
    if (getApiKeyStatusRes.statusCode !== 200 || !getApiKeyStatusRes.responseBody.success) {
      throw new Error('Get API key status test failed');
    }
    console.log('✅ API key status test passed\n');

    // Test 5: Usage Statistics
    console.log('📊 Test 5: Get Usage Statistics');
    const getUsageReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      }
    } as MockAuthenticatedRequest;

    const getUsageRes = new MockResponse() as any;
    await userController.getUsageStats(getUsageReq, getUsageRes);

    console.log('Response Status:', getUsageRes.statusCode);
    console.log('Usage Stats:', JSON.stringify(getUsageRes.responseBody, null, 2));
    
    if (getUsageRes.statusCode !== 200 || !getUsageRes.responseBody.success) {
      throw new Error('Get usage stats test failed');
    }
    console.log('✅ Usage statistics test passed\n');

    // Test 6: Error Handling - Unauthenticated Request
    console.log('🚫 Test 6: Unauthenticated Request Handling');
    const unauthReq = {} as MockAuthenticatedRequest; // No user property

    const unauthRes = new MockResponse() as any;
    await userController.getProfile(unauthReq, unauthRes);

    console.log('Response Status:', unauthRes.statusCode);
    console.log('Error Response:', JSON.stringify(unauthRes.responseBody, null, 2));
    
    if (unauthRes.statusCode !== 401) {
      throw new Error('Unauthenticated request test failed');
    }
    console.log('✅ Unauthenticated request handling test passed\n');

    // Test 7: Input Validation - Invalid API Key
    console.log('❌ Test 7: Invalid API Key Validation');
    const invalidApiKeyReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      body: {
        api_key: 'invalid-key-format'
      }
    } as MockAuthenticatedRequest;

    const invalidApiKeyRes = new MockResponse() as any;
    await userController.setApiKey(invalidApiKeyReq, invalidApiKeyRes);

    console.log('Response Status:', invalidApiKeyRes.statusCode);
    console.log('Validation Error:', JSON.stringify(invalidApiKeyRes.responseBody, null, 2));
    
    if (invalidApiKeyRes.statusCode !== 400) {
      throw new Error('Invalid API key validation test failed');
    }
    console.log('✅ Invalid API key validation test passed\n');

    // Test 8: Usage Increment Simulation
    console.log('📈 Test 8: Usage Increment Test');
    await UserModel.incrementUsage(testUser.id);
    await UserModel.incrementUsage(testUser.id);
    
    const getUsageAfterReq = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      }
    } as MockAuthenticatedRequest;

    const getUsageAfterRes = new MockResponse() as any;
    await userController.getUsageStats(getUsageAfterReq, getUsageAfterRes);

    console.log('Usage After Increment:', JSON.stringify(getUsageAfterRes.responseBody, null, 2));
    
    if (getUsageAfterRes.responseBody.usage.daily_count !== 2) {
      throw new Error('Usage increment test failed');
    }
    console.log('✅ Usage increment test passed\n');

    // Cleanup
    console.log('🧹 Cleanup: Deleting Test Data');
    await UserModel.delete(testUser.id);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All User Controller tests passed successfully!');
    console.log('✅ Issue 3.3: User Controller & Routes - TESTING COMPLETE');

  } catch (error) {
    console.error('❌ User Controller test failed:', error);
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run tests if called directly
if (require.main === module) {
  runUserControllerTests();
}

export { runUserControllerTests }; 