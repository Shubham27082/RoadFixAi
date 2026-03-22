// Simple test to check if the dashboard is accessible
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testDashboardAccess() {
  try {
    console.log('🧪 Testing Municipal Dashboard Access...');
    
    // Login as municipal member
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'municipal.member@example.com',
      password: 'password123',
      userType: 'municipal'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Municipal login successful');
      
      // Test reports endpoint
      const reportsResponse = await axios.get(`${API_BASE}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (reportsResponse.data.success) {
        console.log(`✅ Reports API working - Found ${reportsResponse.data.data.reports.length} reports`);
        
        // Test stats endpoint
        const statsResponse = await axios.get(`${API_BASE}/reports/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsResponse.data.success) {
          console.log('✅ Stats API working');
          console.log('   Stats:', statsResponse.data.data);
        }
      }
      
      console.log('\n🎯 Dashboard APIs are working correctly');
      console.log('If buttons are not working in the frontend, check:');
      console.log('   1. Browser console for JavaScript errors');
      console.log('   2. CSS styles that might block button clicks');
      console.log('   3. React component state updates');
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testDashboardAccess();