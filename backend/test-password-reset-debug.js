const User = require('./models/User');
const { testConnection } = require('./config/database');

async function testPasswordResetDebug() {
  console.log('🔍 Debugging Password Reset Flow...\n');

  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    // Step 1: Create a test user for password reset
    const testEmail = 'resetdebug@example.com';
    
    // Clean up any existing test user
    await User.destroy({ where: { email: testEmail } });

    console.log('1️⃣ Creating test user for password reset...');
    const user = await User.create({
      firstName: 'Reset',
      lastName: 'Debug',
      email: testEmail,
      phone: '+1234567890',
      password: 'oldpassword123',
      ward: 'Ward 1 - Downtown',
      userType: 'citizen',
      isEmailVerified: true // Already verified for testing
    });

    console.log('✅ Test user created');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: oldpassword123');

    // Step 2: Test password reset request
    console.log('\n2️⃣ Testing password reset request...');
    
    // Generate reset token manually (simulating the API call)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    console.log('✅ Reset token generated');
    console.log('🔑 Token:', resetToken);
    console.log('⏰ Expires:', user.passwordResetExpires);

    // Step 3: Test token verification
    console.log('\n3️⃣ Testing token verification...');
    const { Op } = require('sequelize');
    const foundUser = await User.findOne({
      where: {
        passwordResetToken: resetToken,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (foundUser) {
      console.log('✅ Token verification successful');
      console.log('👤 Found user:', foundUser.email);
    } else {
      console.log('❌ Token verification failed');
    }

    // Step 4: Test URLs
    console.log('\n4️⃣ Test URLs:');
    console.log('🔗 Forgot Password: http://localhost:5174/forgot-password');
    console.log('🔗 Reset Password: http://localhost:5174/reset-password?token=' + resetToken);
    console.log('🔗 API Verify Token: http://localhost:5000/api/auth/verify-reset-token/' + resetToken);

    console.log('\n✅ Test user ready for password reset debugging!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPasswordResetDebug();