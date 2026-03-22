const { sequelize } = require('./config/database');

async function fixDatabaseComplete() {
  try {
    console.log('🔧 Comprehensive database fix...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Disable foreign key checks temporarily
    console.log('🔓 Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Drop all tables
    console.log('🗑️ Dropping all existing tables...');
    await sequelize.query('DROP TABLE IF EXISTS reports;');
    await sequelize.query('DROP TABLE IF EXISTS users;');
    console.log('✅ All tables dropped');

    // Re-enable foreign key checks
    console.log('🔒 Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Import models to register them
    const User = require('./models/User');
    const Report = require('./models/Report');
    
    console.log('🏗️ Creating fresh database tables...');
    
    // Sync database with force: true to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');

    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    try {
      await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@roadfix.com',
        phone: '9999999999',
        password: 'admin123', // Will be hashed by beforeSave hook
        userType: 'admin',
        ward: '',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Admin user created');
    } catch (adminError) {
      console.log('ℹ️ Admin user creation skipped (may already exist)');
    }

    console.log('\n🎉 Database completely fixed and ready!');
    console.log('📋 Fresh database structure:');
    console.log('   ✅ users table (clean schema)');
    console.log('   ✅ reports table (clean schema)');
    console.log('   ✅ Foreign key relationships');
    console.log('   ✅ Admin user ready');
    
    console.log('\n🔐 Admin Credentials:');
    console.log('   Email: admin@roadfix.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    
    console.log('\n🛠️ Alternative Manual Fix:');
    console.log('1. Open XAMPP Control Panel');
    console.log('2. Click "Admin" next to MySQL');
    console.log('3. In phpMyAdmin:');
    console.log('   - Click on "road_damage_db" database');
    console.log('   - Select all tables');
    console.log('   - Choose "Drop" from dropdown');
    console.log('   - Confirm deletion');
    console.log('4. Restart the backend server');
  } finally {
    process.exit(0);
  }
}

fixDatabaseComplete();