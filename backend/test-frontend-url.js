const fetch = require('node-fetch');

async function testFrontendURL() {
  try {
    console.log('Testing the exact URL the frontend uses...');
    
    // Login first
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
    const token = loginResult.data.token;
    
    // Test the exact URL and headers the frontend uses
    const frontendURL = 'http://localhost:5000/api/reports/stats';
    console.log('Testing URL:', frontendURL);
    
    const response = await fetch(frontendURL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Response body:', result);
    
    // Also test if there are any CORS issues by checking from different origins
    console.log('\n--- Testing CORS ---');
    const corsResponse = await fetch(frontendURL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:5174'
      }
    });
    
    console.log('CORS test status:', corsResponse.status);
    const corsResult = await corsResponse.json();
    console.log('CORS test result:', corsResult);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendURL();