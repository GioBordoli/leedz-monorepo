const fetch = require('node-fetch');

// Using a sample JWT token pattern - this should be a real token from the logs
// Look for tokens in your browser DevTools Network tab or server logs
const TOKEN_FROM_LOGS = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyLCJlbWFpbCI6ImdpbyUyQm9rb3J1QGdtYWlsLmNvbSIsImlhdCI6MTczODU0MDczOSwiZXhwIjoxNzM4NjI3MTM5fQ.aZVeC5K5qPLXEpxJJWQDtMJ6q4dUxV7bhXHxuTGGqJw'; // From logs in your terminal output

const API_BASE = 'http://localhost:3001/api';

async function testApiEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  
  try {
    // Test 1: Health check first
    console.log('0️⃣ Testing GET /health');
    const healthResponse = await fetch('http://localhost:3001/health');
    console.log(`Health Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Health Response:', healthData);
    }
    console.log('\n---\n');
    
    // Test 2: Get API Key Status
    console.log('1️⃣ Testing GET /api/user/api-key/status');
    console.log(`Using token: ${TOKEN_FROM_LOGS.substring(0, 30)}...`);
    
    const statusResponse = await fetch(`${API_BASE}/user/api-key/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN_FROM_LOGS}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status Response: ${statusResponse.status} ${statusResponse.statusText}`);
    console.log('Response Headers:', Object.fromEntries(statusResponse.headers.entries()));
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Key Status Response:');
      console.log(JSON.stringify(statusData, null, 2));
      
      // Check the expected structure
      const hasKey = statusData?.api_key_status?.has_key;
      const isValid = statusData?.api_key_status?.is_valid;
      console.log(`\n📊 Analysis:`);
      console.log(`   has_key: ${hasKey}`);
      console.log(`   is_valid: ${isValid}`);
      console.log(`   Frontend should show: ${hasKey ? 'Configured' : 'Not Set'}`);
      
    } else {
      const errorText = await statusResponse.text();
      console.log('❌ Error Response:');
      console.log(errorText);
    }
    
    console.log('\n---\n');
    
    // Test 3: Test save endpoint with current key
    console.log('2️⃣ Testing POST /api/user/api-key');
    
    const saveResponse = await fetch(`${API_BASE}/user/api-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_FROM_LOGS}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: 'AIzaSyADHG5b_35YEmRPKsVDw6JqnauDFEbVo9w' })
    });
    
    console.log(`Save Response: ${saveResponse.status} ${saveResponse.statusText}`);
    
    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Save Response:');
      console.log(JSON.stringify(saveData, null, 2));
    } else {
      const errorText = await saveResponse.text();
      console.log('❌ Save Error:');
      console.log(errorText);
    }
    
    console.log('\n---\n');
    
    // Test 4: Check status again after save
    console.log('3️⃣ Testing GET /api/user/api-key/status (after save)');
    
    const statusResponse2 = await fetch(`${API_BASE}/user/api-key/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN_FROM_LOGS}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statusResponse2.ok) {
      const statusData2 = await statusResponse2.json();
      console.log('✅ Updated API Key Status:');
      console.log(JSON.stringify(statusData2, null, 2));
      
      const hasKey = statusData2?.api_key_status?.has_key;
      const isValid = statusData2?.api_key_status?.is_valid;
      console.log(`\n📊 Updated Analysis:`);
      console.log(`   has_key: ${hasKey}`);
      console.log(`   is_valid: ${isValid}`);
      console.log(`   Frontend should show: ${hasKey ? 'Configured' : 'Not Set'}`);
      
    } else {
      const errorText = await statusResponse2.text();
      console.log('❌ Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

console.log('🔑 Using JWT token from server logs...');
testApiEndpoints(); 