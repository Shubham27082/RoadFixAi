async function testCompletePasswordResetFlow() {
  console.log('🧪 Testing Complete Password Reset Flow...\n');

  const testEmail = 'fullreset@example.com';
  
  try {
    // Step 1: Request password reset
    console.log('1️⃣ Step 1: Request password reset');
    const forgotResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const forgotData = await forgotResponse.json();
    console.log('✅ Forgot password response:', forgotData);

    if (!forgotData.success) {
      console.log('❌ Forgot password failed');
      return;
    }

    // Step 2: Get the reset token from database (simulating email click)
    console.log('\n2️⃣ Step 2: Get reset token from database');
    const User = require('./models/User');
    const user = await User.findOne({ where: { email: testEmail } });
    
    if (!user || !user.passwordResetToken) {
      console.log('❌ No reset token found in database');
      return;
    }

    const resetToken = user.passwordResetToken;
    console.log('✅ Reset token found:', resetToken.substring(0, 20) + '...');

    // Step 3: Verify token (what frontend does first)
    console.log('\n3️⃣ Step 3: Verify reset token');
    const verifyResponse = await fetch(`http://localhost:5000/api/auth/verify-reset-token/${resetToken}`);
    const verifyData = await verifyResponse.json();
    console.log('✅ Token verification:', verifyData);

    if (!verifyData.success) {
      console.log('❌ Token verification failed');
      return;
    }

    // Step 4: Reset password
    console.log('\n4️⃣ Step 4: Reset password');
    const resetResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'newpassword789',
        confirmPassword: 'newpassword789'
      })
    });

    const resetData = await resetResponse.json();
    console.log('✅ Password reset response:', resetData);

    if (!resetData.success) {
      console.log('❌ Password reset failed');
      return;
    }

    // Step 5: Test login with new password
    console.log('\n5️⃣ Step 5: Test login with new password');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'newpassword789',
        userType: 'citizen'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login response:', loginData.success ? 'SUCCESS' : 'FAILED');

    if (loginData.success) {
      console.log('\n🎉 Complete password reset flow SUCCESSFUL!');
      console.log('📧 Test email:', testEmail);
      console.log('🔑 New password: newpassword789');
      console.log('🔗 Test URL: http://localhost:5174/reset-password?token=' + resetToken);
    } else {
      console.log('\n❌ Login with new password failed:', loginData.message);
    }

  } catch (error) {
    console.error('❌ Error in password reset flow:', error.message);
  }
}

// Create test user first
async function createTestUser() {
  const User = require('./models/User');
  const testEmail = 'fullreset@example.com';
  
  // Clean up existing user
  await User.destroy({ where: { email: testEmail } });
  
  // Create new test user
  await User.create({
    firstName: 'Full',
    lastName: 'Reset',
    email: testEmail,
    phone: '+1234567890',
    password: 'oldpassword123',
    ward: 'Ward 1 - Downtown',
    userType: 'citizen',
    isEmailVerified: true
  });
  
  console.log('✅ Test user created: ' + testEmail);
}

// Run the test
async function runTest() {
  const { testConnection } = require('./config/database');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('❌ Database not connected');
    return;
  }

  await createTestUser();
  await testCompletePasswordResetFlow();
}

runTest();