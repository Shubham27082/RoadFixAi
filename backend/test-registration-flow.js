const User = require('./models/User');
const { testConnection } = require('./config/database');

async function testRegistrationFlow() {
  console.log('🧪 Testing Registration Flow (No Auto-Login)...\n');

  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    // Step 1: Create a test user for verification
    const testEmail = 'noautologin@example.com';
    
    // Clean up any existing test user
    await User.destroy({ where: { email: testEmail } });

    console.log('1️⃣ Creating test user for registration flow...');
    const user = await User.create({
      firstName: 'No',
      lastName: 'AutoLogin',
      email: testEmail,
      phone: '+1234567890',
      password: 'testpassword123',
      ward: 'Ward 1 - Downtown',
      userType: 'citizen',
      isEmailVerified: false
    });

    // Generate verification token
    const verificationCode = user.generateEmailVerificationToken();
    await user.save();

    console.log('✅ Test user created');
    console.log('📧 Email:', user.email);
    console.log('🔑 Verification Code:', verificationCode);

    console.log('\n2️⃣ Now test the complete flow:');
    console.log('   1. Go to: http://localhost:5174/register');
    console.log('   2. Fill the form with test data');
    console.log('   3. Check email for verification code');
    console.log('   4. Verify email - should redirect to LOGIN page');
    console.log('   5. Login manually with credentials');

    console.log('\n✅ Test user ready for registration flow testing!');
    console.log('🚫 Email verification should NOT auto-login');
    console.log('✅ User must login manually after verification');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRegistrationFlow();