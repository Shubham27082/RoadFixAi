const { sequelize } = require('./config/database');
const User = require('./models/User');

async function checkUserDetails() {
  try {
    console.log('🔍 Checking User Details...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check the specific user
    const user = await User.findOne({ 
      where: { email: 'shubhmkothrkr@gmail.com' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'ward', 'isActive', 'isEmailVerified']
    });

    if (user) {
      console.log('User found:');
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Name: ${user.firstName} ${user.lastName}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - User Type: "${user.userType}"`);
      console.log(`  - Ward: ${user.ward}`);
      console.log(`  - Active: ${user.isActive}`);
      console.log(`  - Email Verified: ${user.isEmailVerified}`);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUserDetails();