const User = require('./models/User');
const { sequelize } = require('./config/database');

async function createCorrectUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Delete existing test users
    await User.destroy({ where: { email: 'john@example.com' } });
    await User.destroy({ where: { email: 'municipal@roadfix.com' } });
    console.log('🗑️ Deleted existing test users');

    // Create citizen user (let the beforeSave hook handle password hashing)
    const citizen = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: 'password123', // Plain text - will be hashed by beforeSave hook
      userType: 'citizen',
      ward: 'Ward 5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Citizen user created');

    // Test password immediately
    const testResult = await citizen.comparePassword('password123');
    console.log('✅ Citizen password test result:', testResult);

    // Create municipal user (let the beforeSave hook handle password hashing)
    const municipal = await User.create({
      firstName: 'Municipal',
      lastName: 'Officer',
      email: 'municipal@roadfix.com',
      phone: '9876543211',
      password: 'municipal123', // Plain text - will be hashed by beforeSave hook
      userType: 'municipal',
      ward: 'Ward 5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Municipal user created');

    // Test password immediately
    const testResult2 = await municipal.comparePassword('municipal123');
    console.log('✅ Municipal password test result:', testResult2);

    console.log('\n🎉 Correct test users created and verified!');
    console.log('Credentials:');
    console.log('- Citizen: john@example.com / password123');
    console.log('- Municipal: municipal@roadfix.com / municipal123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createCorrectUsers();