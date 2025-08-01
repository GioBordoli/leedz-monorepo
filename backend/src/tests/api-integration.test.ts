#!/usr/bin/env ts-node

/**
 * End-to-End API Integration Test Suite
 * Tests complete API flows with real HTTP requests
 */

import database from '../config/database';
import { UserModel, CreateUserData } from '../models/User';
import jwt from 'jsonwebtoken';

// Simple HTTP client for testing
const http = require('http');

interface TestResponse {
  statusCode: number;
  data: any;
}

async function makeRequest(method: string, path: string, data?: any, token?: string): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res: any) => {
      let body = '';
      res.on('data', (chunk: any) => body += chunk);
      res.on('end', () => {
        try {
          const parsedData = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function generateTestJWT(user: any): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    },
    secret,
    { expiresIn: '1h' }
  );
}

async function runApiIntegrationTests() {
  console.log('🧪 Starting API Integration Tests...\n');

  try {
    // Check if server is running
    console.log('🔗 Test Setup: Server Health Check');
    try {
      const healthResponse = await makeRequest('GET', '/health');
      console.log('Health Check Status:', healthResponse.statusCode);
      console.log('Health Response:', healthResponse.data);
      
      if (healthResponse.statusCode !== 200) {
        throw new Error(`Server not responding correctly. Status: ${healthResponse.statusCode}`);
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible on localhost:3001');
      console.log('💡 Please start the server with: cd backend && npm run dev');
      console.log('⏸️  Skipping API integration tests\n');
      return;
    }
    console.log('✅ Server is running and accessible\n');

    // Database connection verification
    console.log('📊 Test Setup: Database Connection');
    const connectionSuccess = await database.testConnection();
    if (!connectionSuccess) {
      throw new Error('Database connection test failed');
    }
    console.log('✅ Database connection verified\n');

    // Create test user for API testing
    console.log('👤 Test Setup: Creating Test User');
    const timestamp = Date.now();
    const testUserData: CreateUserData = {
      email: `test-api-${timestamp}@leedz.online`,
      name: 'Test API User',
      picture: 'https://example.com/api-avatar.jpg',
      google_oauth_id: `google_api_test_${timestamp}`
    };

    const testUser = await UserModel.create(testUserData);
    console.log('✅ Test user created for API testing:', testUser.email, 'ID:', testUser.id);

    // Generate JWT token for authenticated requests
    const authToken = generateTestJWT(testUser);
    console.log('✅ JWT token generated for authentication\n');

    // Test 1: API Health Check
    console.log('🏃 Test 1: API Health and Base Endpoints');
    const apiResponse = await makeRequest('GET', '/api');
    console.log('API Base Status:', apiResponse.statusCode);
    console.log('API Base Response:', apiResponse.data);
    
    if (apiResponse.statusCode !== 200) {
      throw new Error('API base endpoint test failed');
    }
    console.log('✅ API base endpoint test passed\n');

    // Test 2: Unauthenticated User Profile Request
    console.log('🚫 Test 2: Unauthenticated Request (should fail)');
    const unauthResponse = await makeRequest('GET', '/api/user/profile');
    console.log('Unauth Status:', unauthResponse.statusCode);
    console.log('Unauth Response:', unauthResponse.data);
    
    if (unauthResponse.statusCode !== 401) {
      throw new Error('Unauthenticated request should return 401');
    }
    console.log('✅ Unauthenticated request properly rejected\n');

    // Test 3: Authenticated User Profile Request
    console.log('👤 Test 3: Get User Profile (authenticated)');
    const profileResponse = await makeRequest('GET', '/api/user/profile', undefined, authToken);
    console.log('Profile Status:', profileResponse.statusCode);
    console.log('Profile Response:', JSON.stringify(profileResponse.data, null, 2));
    
    if (profileResponse.statusCode !== 200 || !profileResponse.data.success) {
      throw new Error('Authenticated profile request failed');
    }
    console.log('✅ Authenticated profile request test passed\n');

    // Test 4: Update User Profile
    console.log('📝 Test 4: Update User Profile');
    const updateData = {
      name: 'Updated API Test User',
      picture: 'https://example.com/updated-api-avatar.jpg'
    };
    const updateResponse = await makeRequest('PUT', '/api/user/profile', updateData, authToken);
    console.log('Update Status:', updateResponse.statusCode);
    console.log('Update Response:', JSON.stringify(updateResponse.data, null, 2));
    
    if (updateResponse.statusCode !== 200 || !updateResponse.data.success) {
      throw new Error('Profile update request failed');
    }
    console.log('✅ Profile update test passed\n');

    // Test 5: API Key Storage
    console.log('🔑 Test 5: Store Google Places API Key');
    const apiKeyData = {
      api_key: 'TEST_API_KEY_39_CHARS_FOR_TESTING_ONLY1'
    };
    const apiKeyResponse = await makeRequest('POST', '/api/user/api-key', apiKeyData, authToken);
    console.log('API Key Status:', apiKeyResponse.statusCode);
    console.log('API Key Response:', JSON.stringify(apiKeyResponse.data, null, 2));
    
    if (apiKeyResponse.statusCode !== 200 || !apiKeyResponse.data.success) {
      throw new Error('API key storage request failed');
    }
    console.log('✅ API key storage test passed\n');

    // Test 6: Invalid API Key Validation
    console.log('❌ Test 6: Invalid API Key Validation');
    const invalidApiKeyData = {
      api_key: 'invalid-key-format'
    };
    const invalidApiKeyResponse = await makeRequest('POST', '/api/user/api-key', invalidApiKeyData, authToken);
    console.log('Invalid API Key Status:', invalidApiKeyResponse.statusCode);
    console.log('Invalid API Key Response:', JSON.stringify(invalidApiKeyResponse.data, null, 2));
    
    if (invalidApiKeyResponse.statusCode !== 400) {
      throw new Error('Invalid API key should be rejected');
    }
    console.log('✅ Invalid API key validation test passed\n');

    // Test 7: API Key Status Check
    console.log('🔍 Test 7: Check API Key Status');
    const keyStatusResponse = await makeRequest('GET', '/api/user/api-key/status', undefined, authToken);
    console.log('Key Status Status:', keyStatusResponse.statusCode);
    console.log('Key Status Response:', JSON.stringify(keyStatusResponse.data, null, 2));
    
    if (keyStatusResponse.statusCode !== 200 || !keyStatusResponse.data.success) {
      throw new Error('API key status request failed');
    }
    console.log('✅ API key status test passed\n');

    // Test 8: Usage Statistics
    console.log('📊 Test 8: Get Usage Statistics');
    const usageResponse = await makeRequest('GET', '/api/user/usage', undefined, authToken);
    console.log('Usage Status:', usageResponse.statusCode);
    console.log('Usage Response:', JSON.stringify(usageResponse.data, null, 2));
    
    if (usageResponse.statusCode !== 200 || !usageResponse.data.success) {
      throw new Error('Usage statistics request failed');
    }
    console.log('✅ Usage statistics test passed\n');

    // Test 9: Malformed Request Handling
    console.log('⚠️  Test 9: Malformed Request Handling');
    const malformedResponse = await makeRequest('PUT', '/api/user/profile', { invalid: 'data' }, authToken);
    console.log('Malformed Status:', malformedResponse.statusCode);
    console.log('Malformed Response:', JSON.stringify(malformedResponse.data, null, 2));
    
    if (malformedResponse.statusCode !== 400) {
      throw new Error('Malformed request should be rejected');
    }
    console.log('✅ Malformed request handling test passed\n');

    // Cleanup
    console.log('🧹 Cleanup: Deleting Test Data');
    await UserModel.delete(testUser.id);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All API Integration tests passed successfully!');
    console.log('✅ End-to-End API Testing - COMPLETE');

  } catch (error) {
    console.error('❌ API Integration test failed:', error);
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run tests if called directly
if (require.main === module) {
  runApiIntegrationTests();
}

export { runApiIntegrationTests }; 