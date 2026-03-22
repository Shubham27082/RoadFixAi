const User = require('./models/User');
const { testConnection } = require('./config/database');

async function createMobileResetLink() {
  console.log('📱 Creating Mobile-Compatible Password Reset Link...\n');

  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    const testEmail = 'mobiletest@example.com';
    
    // Clean up existing user
    await User.destroy({ where: { email: testEmail } });

    // Create test user
    console.log('1️⃣ Creating test user...');
    const user = await User.create({
      firstName: 'Mobile',
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

    // Get laptop IP address
    const laptopIP = '172.21.69.219';
    const mobileResetUrl = `http://${laptopIP}:5174/reset-password?token=${resetToken}`;

    console.log('\n📱 MOBILE-COMPATIBLE RESET LINK:');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Old Password: oldpassword123');
    console.log('🔗 Mobile Reset URL:');
    console.log(mobileResetUrl);
    
    console.log('\n📱 Mobile Instructions:');
    console.log('1. Make sure your phone is connected to the same WiFi network');
    console.log('2. Copy the URL above');
    console.log('3. Paste it in your mobile browser');
    console.log('4. Enter a new password (min 6 characters)');
    console.log('5. Click "Update Password"');
    console.log('6. Login at: http://' + laptopIP + ':5174/login');

    console.log('\n💻 Laptop Access:');
    console.log('🔗 Laptop URL: http://localhost:5174/reset-password?token=' + resetToken);

    console.log('\n⏰ Token expires in 5 minutes');
    console.log('🔄 If expired, run this script again');

    console.log('\n🌐 Network Status:');
    console.log('- Laptop IP: ' + laptopIP);
    console.log('- Frontend: http://' + laptopIP + ':5174');
    console.log('- Backend: http://' + laptopIP + ':5000');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMobileResetLink();