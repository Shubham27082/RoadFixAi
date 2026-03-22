const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

async function fixAllMunicipalPasswords() {
  try {
    console.log('🔧 Fixing All Municipal User Passwords...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    const password = 'password123';
    const freshHash = await bcrypt.hash(password, 12);
    console.log(`Generated fresh hash for password: ${password}`);

    // Update all municipal users
    const [results] = await sequelize.query(
      "UPDATE users SET password = ? WHERE userType = 'municipal'",
      { replacements: [freshHash] }
    );

    console.log(`✅ Updated ${results.affectedRows} municipal users`);

    // Verify the updates
    const [users] = await sequelize.query(
      "SELECT id, firstName, lastName, email, ward FROM users WHERE userType = 'municipal'"
    );

    console.log('\n📋 Municipal users updated:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Ward: ${user.ward}`);
      console.log(`   Password: ${password}`);
    });

    console.log('\n🎉 All municipal user passwords fixed!');
    console.log('You can now login with any municipal user using password: password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixAllMunicipalPasswords();