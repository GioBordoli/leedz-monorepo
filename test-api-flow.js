const fetch = require('node-fetch');

// Use a real token from your browser network tab or auth logs
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
const API_BASE = 'http://localhost:3001/api';

async function testApiFlow() {
  console.log('🧪 Testing API Flow...\n');
  
  try {
    // Test 1: Get API Key Status
    console.log('1️⃣ Testing GET /api/user/api-key/status');
    const statusResponse = await fetch(`${API_BASE}/user/api-key/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${statusResponse.status}`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Key Status:', JSON.stringify(statusData, null, 2));
    } else {
      const errorData = await statusResponse.text();
      console.log('❌ Error:', errorData);
    }
    
    console.log('\n---\n');
    
    // Test 2: Save API Key (only if you want to test)
    /*
    console.log('2️⃣ Testing POST /api/user/api-key');
    const saveResponse = await fetch(`${API_BASE}/user/api-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: 'AIzaSyADHG5b_35YEmRPKsVDw6JqnauDFEbVo9w' })
    });
    
    console.log(`Save Status: ${saveResponse.status}`);
    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Save Response:', JSON.stringify(saveData, null, 2));
    } else {
      const errorData = await saveResponse.text();
      console.log('❌ Save Error:', errorData);
    }
    */
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  console.log('❌ Please replace TEST_TOKEN with a real JWT token from your browser');
  console.log('💡 Get token from: Browser DevTools → Network → Any API call → Authorization header');
} else {
  testApiFlow();
} 