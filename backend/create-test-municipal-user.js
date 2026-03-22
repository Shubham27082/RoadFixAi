const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const User = require('./models/User');

async function createTestMunicipalUser() {
  try {
    console.log('🔧 Creating Test Municipal User...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Create a new test municipal user
    const testPassword = 'test123';
    // Don't hash manually - let the beforeSave hook do it

    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'Municipal',
      email: 'test.municipal@example.com',
      phone: '1234567890',
      password: testPassword, // Plain text - will be hashed by hook
      userType: 'municipal',
      ward: 'Ward 6 - Industrial Area',
      isEmailVerified: true,
      isActive: true
    });

    console.log('✅ Test municipal user created:');
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User Type: ${testUser.userType}`);
    console.log(`   Ward: ${testUser.ward}`);

    // Test the password immediately
    const isValid = await testUser.comparePassword(testPassword);
    console.log(`   Password test: ${isValid}`);

    console.log('\n🎉 Test user ready for login!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

createTestMunicipalUser();