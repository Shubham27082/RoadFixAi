const { sequelize } = require('./config/database');

async function fixDatabaseTablespace() {
  try {
    console.log('🔧 Fixing database tablespace issue...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Drop the problematic reports table if it exists
    console.log('🗑️ Dropping existing reports table...');
    await sequelize.query('DROP TABLE IF EXISTS reports;');
    console.log('✅ Reports table dropped');

    // Drop users table if it exists (due to foreign key constraints)
    console.log('🗑️ Dropping existing users table...');
    await sequelize.query('DROP TABLE IF EXISTS users;');
    console.log('✅ Users table dropped');

    // Now recreate all tables with proper structure
    console.log('🏗️ Recreating database tables...');
    
    // Import models to register them
    const User = require('./models/User');
    const Report = require('./models/Report');
    
    // Sync database with force: true to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables recreated successfully');

    console.log('\n🎉 Database tablespace issue fixed!');
    console.log('📋 Tables created:');
    console.log('   - users (with proper schema)');
    console.log('   - reports (with proper schema and relationships)');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    console.log('\n💡 Manual fix options:');
    console.log('1. Open XAMPP phpMyAdmin');
    console.log('2. Drop the road_damage_db database');
    console.log('3. Create a new road_damage_db database');
    console.log('4. Restart the backend server');
  } finally {
    process.exit(0);
  }
}

fixDatabaseTablespace();