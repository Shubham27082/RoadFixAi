const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing citizen login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'password123',
      userType: 'citizen'
    });
    
    console.log('Login response:', response.data);
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

testLogin();