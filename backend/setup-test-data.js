const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const User = require('./models/User');
const Report = require('./models/Report');

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...\n');

    // Create test citizen
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if citizen already exists
    let citizen = await User.findOne({ where: { email: 'john.doe@example.com' } });
    if (!citizen) {
      citizen = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        password: hashedPassword,
        userType: 'citizen',
        ward: 'Ward-5',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Created test citizen: john.doe@example.com');
    } else {
      console.log('✅ Test citizen already exists: john.doe@example.com');
    }

    // Check if municipal member already exists
    let municipalMember = await User.findOne({ where: { email: 'municipal.member@example.com' } });
    if (!municipalMember) {
      municipalMember = await User.create({
        firstName: 'Municipal',
        lastName: 'Member',
        email: 'municipal.member@example.com',
        phone: '+1234567891',
        password: hashedPassword,
        userType: 'municipal',
        ward: 'Ward-5',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Created test municipal member: municipal.member@example.com');
    } else {
      console.log('✅ Test municipal member already exists: municipal.member@example.com');
    }

    // Create another municipal member for testing
    let municipalMember2 = await User.findOne({ where: { email: 'ward.officer@example.com' } });
    if (!municipalMember2) {
      municipalMember2 = await User.create({
        firstName: 'Ward',
        lastName: 'Officer',
        email: 'ward.officer@example.com',
        phone: '+1234567892',
        password: hashedPassword,
        userType: 'municipal',
        ward: 'Ward-5',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Created test ward officer: ward.officer@example.com');
    } else {
      console.log('✅ Test ward officer already exists: ward.officer@example.com');
    }

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📋 Test Accounts:');
    console.log('   Citizen: john.doe@example.com / password123');
    console.log('   Municipal Member: municipal.member@example.com / password123');
    console.log('   Ward Officer: ward.officer@example.com / password123');
    console.log('   All users are in Ward-5');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    process.exit(0);
  }
}

setupTestData();