const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint to verify routes are working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

// Mock API key status endpoint (no auth required for testing)
app.get('/api/user/api-key/status', (req, res) => {
  console.log('📋 API Key Status requested');
  console.log('Headers:', req.headers);
  
  res.json({
    success: true,
    api_key_status: {
      has_key: false,
      key_preview: null,
      last_updated: null,
      is_valid: false
    }
  });
});

// Mock API key save endpoint (no auth required for testing)
app.post('/api/user/api-key', (req, res) => {
  console.log('💾 API Key Save requested');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  const { api_key } = req.body;
  
  if (!api_key) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  res.json({
    success: true,
    message: 'API key stored successfully',
    key_preview: `${api_key.substring(0, 10)}...${api_key.substring(api_key.length - 4)}`,
    stored_at: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Catch all to see what requests are coming in
app.use('*', (req, res) => {
  console.log(`❓ Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.listen(3001, () => {
  console.log('🧪 Test server running on port 3001');
  console.log('📊 Health check: http://localhost:3001/health');
  console.log('🔧 Test endpoint: http://localhost:3001/api/test');
}); 