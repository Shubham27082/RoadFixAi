const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testPassword() {
  try {
    console.log('🔍 Testing password...\n');

    const user = await User.findOne({ where: { email: 'john.doe@example.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);

    // Test direct bcrypt compare
    const directCompare = await bcrypt.compare('password123', user.password);
    console.log('Direct bcrypt compare:', directCompare);

    // Test user method
    const methodCompare = await user.comparePassword('password123');
    console.log('User method compare:', methodCompare);

    // Test wrong password
    const wrongPassword = await user.comparePassword('wrongpassword');
    console.log('Wrong password test:', wrongPassword);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testPassword();