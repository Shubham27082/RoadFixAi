const User = require('./models/User');
const { testConnection } = require('./config/database');

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Token Generation...\n');

  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    // Find a user with a reset token
    const userWithToken = await User.findOne({
      where: {
        passwordResetToken: { [require('sequelize').Op.ne]: null }
      }
    });

    if (userWithToken) {
      console.log('✅ Found user with reset token:');
      console.log('📧 Email:', userWithToken.email);
      console.log('🔑 Token:', userWithToken.passwordResetToken);
      console.log('⏰ Expires:', userWithToken.passwordResetExpires);
      console.log('🕐 Current time:', new Date());
      
      const isExpired = new Date() > userWithToken.passwordResetExpires;
      console.log('❓ Is expired:', isExpired);

      if (!isExpired) {
        const resetUrl = `http://localhost:5174/reset-password?token=${userWithToken.passwordResetToken}`;
        console.log('\n🔗 Test this reset URL:');
        console.log(resetUrl);
      } else {
        console.log('\n⚠️ Token has expired. Request a new password reset.');
      }
    } else {
      console.log('❌ No users found with active reset tokens');
      console.log('💡 Try requesting a password reset first');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPasswordReset();