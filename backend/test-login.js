const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        userType: 'citizen'
      })
    });

    const data = await response.json();
    console.log('Login Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('🔑 JWT Token received');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();