const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

require('dotenv').config();

const API_BASE = 'http://localhost:3001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

async function testWithRealUser() {
  console.log('🧪 Testing API with Real User...\n');
  
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Get a real user from database
    const userResult = await pool.query('SELECT id, email FROM users LIMIT 1');
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 Using user: ${user.email} (ID: ${user.id})`);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log(`🔑 Generated token: ${token.substring(0, 20)}...\n`);
    
    // Test 1: Get API Key Status
    console.log('1️⃣ Testing GET /api/user/api-key/status');
    const statusResponse = await fetch(`${API_BASE}/user/api-key/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response Status: ${statusResponse.status} ${statusResponse.statusText}`);
    console.log(`Response Headers:`, Object.fromEntries(statusResponse.headers.entries()));
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Key Status Response:');
      console.log(JSON.stringify(statusData, null, 2));
    } else {
      const errorText = await statusResponse.text();
      console.log('❌ Error Response:');
      console.log(errorText);
    }
    
    console.log('\n---\n');
    
    // Test 2: Check if we can test the save endpoint
    console.log('2️⃣ Testing POST /api/user/api-key (saving test key)');
    const saveResponse = await fetch(`${API_BASE}/user/api-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: 'test-api-key-12345' })
    });
    
    console.log(`Save Response Status: ${saveResponse.status} ${saveResponse.statusText}`);
    
    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Save Response:');
      console.log(JSON.stringify(saveData, null, 2));
    } else {
      const errorText = await saveResponse.text();
      console.log('❌ Save Error Response:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testWithRealUser(); 