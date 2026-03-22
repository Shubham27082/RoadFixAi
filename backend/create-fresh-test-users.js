const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sequelize } = require('./config/database');

async function createFreshUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Delete existing test users
    await User.destroy({ where: { email: 'john@example.com' } });
    await User.destroy({ where: { email: 'municipal@roadfix.com' } });
    console.log('🗑️ Deleted existing test users');

    // Create fresh citizen user
    const citizenPassword = await bcrypt.hash('password123', 10);
    console.log('Citizen password hash:', citizenPassword);
    
    const citizen = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: citizenPassword,
      userType: 'citizen',
      ward: 'Ward 5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Fresh citizen user created');

    // Test password immediately
    const testResult = await citizen.comparePassword('password123');
    console.log('✅ Password test result:', testResult);

    // Create fresh municipal user
    const municipalPassword = await bcrypt.hash('municipal123', 10);
    console.log('Municipal password hash:', municipalPassword);
    
    const municipal = await User.create({
      firstName: 'Municipal',
      lastName: 'Officer',
      email: 'municipal@roadfix.com',
      phone: '9876543211',
      password: municipalPassword,
      userType: 'municipal',
      ward: 'Ward 5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Fresh municipal user created');

    // Test password immediately
    const testResult2 = await municipal.comparePassword('municipal123');
    console.log('✅ Password test result:', testResult2);

    console.log('\n🎉 Fresh test users created and verified!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createFreshUsers();