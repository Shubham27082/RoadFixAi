const fetch = require('node-fetch');

async function testVerification() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        verificationCode: '723422'
      })
    });

    const data = await response.json();
    console.log('Verification Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Email verification successful!');
      console.log('🎉 User can now login');
    } else {
      console.log('❌ Verification failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVerification();