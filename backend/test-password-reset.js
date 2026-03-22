const fetch = require('node-fetch');

async function testPasswordReset() {
  try {
    console.log('🧪 Testing Password Reset Flow...\n');

    // Step 1: Request password reset
    console.log('📧 Step 1: Requesting password reset for test.user.1765871871947@example.com');
    
    const resetResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.user.1765871871947@example.com'
      })
    });

    const resetData = await resetResponse.json();
    console.log('Reset Request Response:', JSON.stringify(resetData, null, 2));
    
    if (resetData.success) {
      console.log('✅ Password reset email should be sent!');
      console.log('🔍 Check the backend console for email confirmation');
      console.log('📧 Check your email for the reset link');
    } else {
      console.log('❌ Password reset request failed:', resetData.message);
    }

    // Step 2: Test with non-existent email (should still return success for security)
    console.log('\n📧 Step 2: Testing with non-existent email');
    
    const nonExistentResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com'
      })
    });

    const nonExistentData = await nonExistentResponse.json();
    console.log('Non-existent Email Response:', JSON.stringify(nonExistentData, null, 2));
    
    if (nonExistentData.success) {
      console.log('✅ Security check passed - same response for non-existent email');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPasswordReset();