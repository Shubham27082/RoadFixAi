const { sequelize } = require('./config/database');

async function fixDatabaseIndexes() {
  console.log('🔧 Fixing database indexes issue...\n');

  try {
    // Drop existing tables to start fresh
    console.log('1️⃣ Dropping existing tables...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS reports');
    await sequelize.query('DROP TABLE IF EXISTS users');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables dropped');

    // Sync database with force to recreate tables
    console.log('2️⃣ Creating tables with new index configuration...');
    await sequelize.sync({ force: true });
    console.log('✅ Tables created successfully');

    console.log('\n🎉 Database indexes fixed!');
    console.log('💡 You can now restart the server');

  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDatabaseIndexes();