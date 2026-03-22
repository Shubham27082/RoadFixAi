const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sequelize } = require('./config/database');

async function createAdditionalMunicipalUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Define additional municipal users for different wards
    const municipalUsers = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@ward1.gov.in',
        phone: '+919876543211',
        ward: 'Ward 1 - Downtown',
        userType: 'municipal'
      },
      {
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@ward2.gov.in',
        phone: '+919876543212',
        ward: 'Ward 2 - North District',
        userType: 'municipal'
      },
      {
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.wilson@ward2.gov.in',
        phone: '+919876543213',
        ward: 'Ward 2 - North District',
        userType: 'municipal'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@ward3.gov.in',
        phone: '+919876543214',
        ward: 'Ward 3 - East Side',
        userType: 'municipal'
      },
      {
        firstName: 'Emma',
        lastName: 'Taylor',
        email: 'emma.taylor@ward3.gov.in',
        phone: '+919876543215',
        ward: 'Ward 3 - East Side',
        userType: 'municipal'
      }
    ];

    const defaultPassword = 'municipal123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    console.log('Creating additional municipal users...\n');

    for (const userData of municipalUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists - skipping`);
        continue;
      }

      // Create new municipal user
      const newUser = await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true
      });

      console.log(`✅ Created: ${newUser.firstName} ${newUser.lastName}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Ward: ${newUser.ward}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log('');
    }

    console.log('🎉 Additional municipal users created successfully!');
    console.log('📧 All users have the same password: municipal123');
    console.log('');
    console.log('Now you can test the ward member dropdown with real data from different wards!');

  } catch (error) {
    console.error('❌ Error creating municipal users:', error.message);
  } finally {
    process.exit(0);
  }
}

createAdditionalMunicipalUsers();