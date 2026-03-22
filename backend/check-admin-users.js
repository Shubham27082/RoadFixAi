const { sequelize } = require('./config/database');
const User = require('./models/User');

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking Admin Users...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check for existing admin users
    const adminUsers = await User.findAll({
      where: { userType: 'admin' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'isActive', 'isEmailVerified']
    });

    console.log(`📊 Found ${adminUsers.length} admin users:`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Type: ${user.userType}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Email Verified: ${user.isEmailVerified}`);
        console.log('---');
      });
    } else {
      console.log('⚠️  No admin users found in database');
    }

    // Check all user types
    const [results] = await sequelize.query(
      "SELECT userType, COUNT(*) as count FROM users GROUP BY userType"
    );

    console.log('\n📈 User Statistics:');
    results.forEach(result => {
      console.log(`   ${result.userType}: ${result.count} users`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdminUsers();