const fetch = require('node-fetch');

async function testStatsEndpoint() {
  try {
    console.log('Testing /api/reports/stats endpoint...');
    
    // First, let's test without authentication to see the response
    const response = await fetch('http://localhost:5000/api/reports/stats');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('Response body:', result);
    
    // Try to parse as JSON
    try {
      const jsonResult = JSON.parse(result);
      console.log('Parsed JSON:', jsonResult);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

testStatsEndpoint();