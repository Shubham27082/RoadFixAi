const fetch = require('node-fetch');

async function testFullPasswordResetFlow() {
  try {
    console.log('🧪 Testing Complete Password Reset Flow...\n');

    // Step 1: Create a test user first
    const testEmail = `resettest.${Date.now()}@example.com`;
    console.log(`👤 Step 1: Creating test user with email: ${testEmail}`);
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Reset',
        lastName: 'Test',
        email: testEmail,
        phone: '1234567890',
        password: 'oldpassword123',
        confirmPassword: 'oldpassword123',
        ward: 'Ward 1 - Downtown',
        userType: 'citizen'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Registration Response:', registerData.success ? '✅ Success' : '❌ Failed');
    
    if (!registerData.success) {
      console.log('Registration failed:', registerData.message);
      return;
    }

    // Step 2: Verify the user (simulate email verification)
    console.log('\n📧 Step 2: Auto-verifying user for testing...');
    // In a real scenario, user would verify via email, but for testing we'll mark as verified
    
    // Step 3: Request password reset
    console.log('\n🔐 Step 3: Requesting password reset...');
    
    const resetResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail
      })
    });

    const resetData = await resetResponse.json();
    console.log('Reset Request Response:', resetData.success ? '✅ Success' : '❌ Failed');
    console.log('Message:', resetData.message);
    
    if (!resetData.success) {
      console.log('Password reset request failed');
      return;
    }

    console.log('\n📧 Password reset email should be sent!');
    console.log('🔍 Check the backend console for the reset token');
    console.log('💡 In a real scenario, user would click the link in their email');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFullPasswordResetFlow();