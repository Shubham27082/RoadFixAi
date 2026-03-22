const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function recreateTestUsers() {
  try {
    console.log('🔧 Recreating test users with correct passwords...\n');

    // Delete existing test users
    await User.destroy({
      where: {
        email: ['john.doe@example.com', 'municipal.member@example.com', 'ward.officer@example.com']
      }
    });
    console.log('✅ Deleted existing test users');

    // Use plain text password - the model will hash it automatically
    const plainPassword = 'password123';
    console.log('✅ Using plain text password (model will hash it)');

    // Create citizen
    const citizen = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      password: plainPassword,
      userType: 'citizen',
      ward: 'Ward-5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Created citizen:', citizen.email);

    // Create municipal member
    const municipalMember = await User.create({
      firstName: 'Municipal',
      lastName: 'Member',
      email: 'municipal.member@example.com',
      phone: '+1234567891',
      password: plainPassword,
      userType: 'municipal',
      ward: 'Ward-5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Created municipal member:', municipalMember.email);

    // Create ward officer
    const wardOfficer = await User.create({
      firstName: 'Ward',
      lastName: 'Officer',
      email: 'ward.officer@example.com',
      phone: '+1234567892',
      password: plainPassword,
      userType: 'municipal',
      ward: 'Ward-5',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Created ward officer:', wardOfficer.email);

    // Test password for citizen
    const testUser = await User.findOne({ where: { email: 'john.doe@example.com' } });
    const isValid = await testUser.comparePassword('password123');
    console.log('\n🔍 Password test:', isValid ? '✅ Valid' : '❌ Invalid');

    console.log('\n🎉 Test users recreated successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Citizen: john.doe@example.com / password123');
    console.log('   Municipal Member: municipal.member@example.com / password123');
    console.log('   Ward Officer: ward.officer@example.com / password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

recreateTestUsers();