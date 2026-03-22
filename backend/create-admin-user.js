const { sequelize } = require('./config/database');
const User = require('./models/User');

async function createAdminUser() {
  try {
    console.log('🔧 Creating Admin User...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Create admin user
    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@roadfix.com',
      phone: '9999999999',
      password: 'admin123', // Will be hashed by the beforeSave hook
      userType: 'admin',
      ward: 'System Administration',
      isEmailVerified: true,
      isActive: true
    };

    const adminUser = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
    console.log(`   User Type: ${adminUser.userType}`);
    console.log(`   Ward: ${adminUser.ward}`);
    console.log(`   ID: ${adminUser.id}`);

    console.log('\n🎉 Admin user ready for login!');
    console.log('\n🔐 Login Instructions:');
    console.log('1. Go to the login page');
    console.log('2. Select "Admin" as user type');
    console.log('3. Use the credentials above');

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('⚠️  Admin user already exists with this email');
      
      // Get existing admin user
      const existingAdmin = await User.findOne({ 
        where: { email: 'admin@roadfix.com' },
        attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'ward']
      });
      
      if (existingAdmin) {
        console.log('\n📋 Existing Admin Credentials:');
        console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
        console.log(`   Email: ${existingAdmin.email}`);
        console.log(`   Password: admin123 (if not changed)`);
        console.log(`   User Type: ${existingAdmin.userType}`);
        console.log(`   Ward: ${existingAdmin.ward}`);
      }
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  } finally {
    await sequelize.close();
  }
}

createAdminUser();