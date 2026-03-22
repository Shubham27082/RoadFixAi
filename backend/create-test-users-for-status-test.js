const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sequelize } = require('./config/database');

async function createTestUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create citizen user
    const citizenPassword = await bcrypt.hash('password123', 10);
    const [citizen, citizenCreated] = await User.findOrCreate({
      where: { email: 'john@example.com' },
      defaults: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: citizenPassword,
        userType: 'citizen',
        ward: 'Ward 5',
        isEmailVerified: true,
        isActive: true
      }
    });

    if (citizenCreated) {
      console.log('✅ Citizen user created: john@example.com / password123');
    } else {
      console.log('ℹ️ Citizen user already exists: john@example.com');
    }

    // Create municipal user
    const municipalPassword = await bcrypt.hash('municipal123', 10);
    const [municipal, municipalCreated] = await User.findOrCreate({
      where: { email: 'municipal@roadfix.com' },
      defaults: {
        firstName: 'Municipal',
        lastName: 'Officer',
        email: 'municipal@roadfix.com',
        phone: '9876543211',
        password: municipalPassword,
        userType: 'municipal',
        ward: 'Ward 5',
        isEmailVerified: true,
        isActive: true
      }
    });

    if (municipalCreated) {
      console.log('✅ Municipal user created: municipal@roadfix.com / municipal123');
    } else {
      console.log('ℹ️ Municipal user already exists: municipal@roadfix.com');
    }

    console.log('\n🎉 Test users ready for status update testing!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    process.exit(0);
  }
}

createTestUsers();