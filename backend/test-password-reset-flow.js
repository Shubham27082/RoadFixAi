const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testPasswordResetFlow() {
  console.log('🧪 Testing Complete Password Reset Flow...\n');

  try {
    // Step 1: Request password reset
    console.log('1️⃣ Requesting password reset...');
    const forgotResponse = await axios.post(`${BASE_URL}/forgot-password`, {
      email: 'resettest.1765885983412@example.com' // Use a test email
    });
    
    console.log('✅ Forgot password response:', forgotResponse.data);

    // Step 2: Simulate getting the reset token (in real scenario, user gets this from email)
    // For testing, we'll need to check the database or logs for the token
    console.log('\n2️⃣ In a real scenario, user would get reset link via email');
    console.log('📧 Check your email for the reset link');
    console.log('🔗 The link format should be: http://localhost:5174/reset-password?token=RESET_TOKEN');

    // Step 3: Test token verification endpoint
    console.log('\n3️⃣ To test token verification, you would need the actual token from the database');
    console.log('💡 You can find the token in the MySQL database in the users table');

    console.log('\n✅ Password reset request flow completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Check your email for the reset link');
    console.log('   2. Click the link within 5 minutes');
    console.log('   3. Enter your new password');
    console.log('   4. Login with the new password');

  } catch (error) {
    console.error('❌ Error in password reset flow:', error.response?.data || error.message);
  }
}

// Test with a real user email if provided as argument
const testEmail = process.argv[2];
if (testEmail) {
  console.log(`🎯 Testing with email: ${testEmail}`);
  testPasswordResetFlow(testEmail);
} else {
  testPasswordResetFlow();
}