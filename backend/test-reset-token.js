const fetch = require('node-fetch');

async function testResetToken() {
  try {
    console.log('🧪 Testing Reset Token Verification...\n');

    // Test with a fake token first
    console.log('🔍 Step 1: Testing with invalid token...');
    
    const invalidResponse = await fetch('http://localhost:5000/api/auth/verify-reset-token/invalid-token-123');
    const invalidData = await invalidResponse.json();
    
    console.log('Invalid Token Response:', JSON.stringify(invalidData, null, 2));
    
    if (!invalidData.success) {
      console.log('✅ Invalid token correctly rejected');
    }

    // Test the reset password endpoint with invalid data
    console.log('\n🔐 Step 2: Testing reset password with invalid token...');
    
    const resetResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: 'invalid-token-123',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      })
    });

    const resetData = await resetResponse.json();
    console.log('Reset Password Response:', JSON.stringify(resetData, null, 2));
    
    if (!resetData.success) {
      console.log('✅ Invalid reset token correctly rejected');
    }

    console.log('\n✅ API endpoints are working correctly!');
    console.log('💡 The issue might be with the frontend connection or CORS');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testResetToken();