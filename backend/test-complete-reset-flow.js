const User = require('./models/User');
const { testConnection } = require('./config/database');

async function testCompleteResetFlow() {
  console.log('🧪 Testing Complete Password Reset Flow...\n');

  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    // Step 1: Create or find a test user
    const testEmail = 'resettest@example.com';
    let user = await User.findOne({ where: { email: testEmail } });
    
    if (!user) {
      console.log('1️⃣ Creating test user...');
      user = await User.create({
        firstName: 'Reset',
        lastName: 'Test',
        email: testEmail,
        phone: '+1234567890',
        password: 'oldpassword123',
        ward: 'Ward 1 - Downtown',
        userType: 'citizen',
        isEmailVerified: true
      });
      console.log('✅ Test user created');
    } else {
      console.log('1️⃣ Using existing test user');
    }

    console.log('📧 Test user email:', user.email);
    console.log('🔑 Current password: oldpassword123');

    console.log('\n2️⃣ Now test the password reset flow:');
    console.log('   1. Go to: http://localhost:5174/forgot-password');
    console.log('   2. Enter email:', testEmail);
    console.log('   3. Check your email for the reset link');
    console.log('   4. Click the link and set new password');
    console.log('   5. Login with the new password');

    console.log('\n✅ Test user is ready for password reset testing!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteResetFlow();