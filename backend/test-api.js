const fetch = require('node-fetch');

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        confirmPassword: 'password123',
        ward: 'Ward 1 - Downtown',
        userType: 'citizen'
      })
    });

    const data = await response.json();
    console.log('Registration Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Registration successful!');
      console.log('📧 Check backend console for verification code');
    } else {
      console.log('❌ Registration failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRegistration();