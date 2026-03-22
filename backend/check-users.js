const User = require('./models/User');
const { sequelize } = require('./config/database');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'userType', 'isEmailVerified', 'isActive']
    });
    
    console.log('\n📊 Users in database:');
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Type: ${user.userType}`);
        console.log(`  Email Verified: ${user.isEmailVerified}`);
        console.log(`  Active: ${user.isActive}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();