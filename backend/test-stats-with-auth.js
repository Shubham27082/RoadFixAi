const fetch = require('node-fetch');

async function testStatsWithAuth() {
  try {
    console.log('Testing /api/reports/stats endpoint with authentication...');
    
    // First, let's login to get a real token
    console.log('Step 1: Logging in to get token...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'demo.municipal@example.com',
        password: 'demo123',
        userType: 'municipal'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login response:', loginResult);
    
    if (!loginResult.success) {
      console.log('Login failed, cannot test stats endpoint');
      return;
    }
    
    const token = loginResult.data.token;
    console.log('Got token:', token ? 'Yes' : 'No');
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
    
    // Now test the stats endpoint with the real token
    console.log('Step 2: Testing stats endpoint with token...');
    const statsResponse = await fetch('http://localhost:5000/api/reports/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Stats response status:', statsResponse.status);
    
    const statsResult = await statsResponse.json();
    console.log('Stats response:', statsResult);
    
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

testStatsWithAuth();