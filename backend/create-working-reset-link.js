const User = require('./models/User');
const { testConnection } = require('./config/database');

async function createWorkingResetLink() {
  console.log('🔧 Creating Working Password Reset Link...\n');

  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    const testEmail = 'workingtest@example.com';
    
    // Clean up existing user
    await User.destroy({ where: { email: testEmail } });

    // Create test user
    console.log('1️⃣ Creating test user...');
    const user = await User.create({
      firstName: 'Working',
      lastName: 'Test',
      email: testEmail,
      phone: '+1234567890',
      password: 'oldpassword123',
      ward: 'Ward 1 - Downtown',
      userType: 'citizen',
      isEmailVerified: true
    });

    console.log('✅ Test user created');

    // Generate reset token
    console.log('2️⃣ Generating reset token...');
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    console.log('✅ Reset token generated');

    // Create the working reset URL
    const resetUrl = `http://localhost:5174/reset-password?token=${resetToken}`;

    console.log('\n🎯 WORKING PASSWORD RESET LINK:');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Old Password: oldpassword123');
    console.log('🔗 Reset URL:');
    console.log(resetUrl);
    console.log('\n📱 Instructions:');
    console.log('1. Copy the URL above');
    console.log('2. Paste it in your mobile browser');
    console.log('3. Enter a new password (min 6 characters)');
    console.log('4. Click "Update Password"');
    console.log('5. Login with new password at: http://localhost:5174/login');

    console.log('\n⏰ Token expires in 5 minutes');
    console.log('🔄 If expired, run this script again to generate a new link');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createWorkingResetLink();