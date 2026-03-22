const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const User = require('./models/User');

async function testPasswordDirect() {
  try {
    console.log('🔧 Testing Password Direct...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get the user
    const user = await User.findOne({ 
      where: { email: 'test.municipal@example.com' }
    });

    if (user) {
      console.log(`User found: ${user.firstName} ${user.lastName}`);
      console.log(`Stored password hash: ${user.password.substring(0, 20)}...`);
      
      // Test password comparison
      const testPassword = 'test123';
      console.log(`Testing password: ${testPassword}`);
      
      const isValid = await user.comparePassword(testPassword);
      console.log(`Password valid: ${isValid}`);
      
      // Also test direct bcrypt comparison
      const directCompare = await bcrypt.compare(testPassword, user.password);
      console.log(`Direct bcrypt compare: ${directCompare}`);
      
      // Create a new hash and test
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log(`New hash created: ${newHash.substring(0, 20)}...`);
      
      const newHashTest = await bcrypt.compare(testPassword, newHash);
      console.log(`New hash test: ${newHashTest}`);
      
      // Update user with new hash
      await user.update({ password: newHash });
      console.log('✅ Password updated with new hash');
      
      // Reload user from database
      await user.reload();
      console.log(`Reloaded password hash: ${user.password.substring(0, 20)}...`);
      
      // Test again
      const finalTest = await user.comparePassword(testPassword);
      console.log(`Final test: ${finalTest}`);
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testPasswordDirect();