const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkTestUsers() {
  try {
    console.log('🔍 Checking test users...\n');

    const users = await User.findAll({
      where: {
        email: ['john.doe@example.com', 'municipal.member@example.com', 'ward.officer@example.com']
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'ward', 'isEmailVerified', 'isActive']
    });

    console.log('Found users:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  Type: ${user.userType}, Ward: ${user.ward}`);
      console.log(`  Verified: ${user.isEmailVerified}, Active: ${user.isActive}\n`);
    });

    // Test password for first user
    if (users.length > 0) {
      const user = await User.findByPk(users[0].id);
      const isValidPassword = await bcrypt.compare('password123', user.password);
      console.log(`Password test for ${user.email}: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkTestUsers();