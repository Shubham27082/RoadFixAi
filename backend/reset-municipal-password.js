const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const User = require('./models/User');

async function resetMunicipalPassword() {
  try {
    console.log('🔧 Resetting Municipal User Password...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Skip associations for this simple script

    // Find municipal users
    const municipalUsers = await User.findAll({
      where: { userType: 'municipal' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
    });

    console.log(`Found ${municipalUsers.length} municipal users:`);
    municipalUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.ward}`);
    });

    // Reset password for all municipal users to 'password123'
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    for (const user of municipalUsers) {
      await user.update({ password: hashedPassword });
      console.log(`✅ Password reset for ${user.firstName} ${user.lastName}`);
    }

    console.log(`\n🎉 All municipal user passwords reset to: ${newPassword}`);
    console.log('You can now login with these credentials in the frontend.');

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await sequelize.close();
  }
}

resetMunicipalPassword();