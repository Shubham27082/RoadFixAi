const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSimpleReport() {
  try {
    // Login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo.citizen@example.com',
      password: 'demo123',
      userType: 'citizen'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Simple report data
    const reportData = {
      locationAddress: 'Test Street, Bangalore',
      damageType: 'Pothole',
      severity: 'high'
    };
    
    console.log('📝 Creating simple report...');
    const reportResponse = await axios.post(`${API_BASE}/reports`, reportData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Report created:', reportResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSimpleReport();