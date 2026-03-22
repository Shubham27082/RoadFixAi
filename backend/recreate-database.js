const mysql = require('mysql2/promise');
require('dotenv').config();

async function recreateDatabase() {
  let connection;
  
  try {
    console.log('🔧 Recreating database completely...');
    
    // Connect to MySQL without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });
    
    console.log('✅ Connected to MySQL server');

    // Drop the entire database
    console.log('🗑️ Dropping road_damage_db database...');
    await connection.execute('DROP DATABASE IF EXISTS road_damage_db;');
    console.log('✅ Database dropped');

    // Create fresh database
    console.log('🏗️ Creating fresh road_damage_db database...');
    await connection.execute('CREATE DATABASE road_damage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    console.log('✅ Fresh database created');

    await connection.end();

    // Now use Sequelize to create tables
    console.log('📋 Creating tables with Sequelize...');
    const { sequelize } = require('./config/database');
    
    await sequelize.authenticate();
    console.log('✅ Connected to new database');

    // Import models
    const User = require('./models/User');
    const Report = require('./models/Report');
    
    // Create tables
    await sequelize.sync({ force: true });
    console.log('✅ Tables created successfully');

    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@roadfix.com',
      phone: '9999999999',
      password: 'admin123',
      userType: 'admin',
      ward: 'Ward 1 - Downtown',
      isEmailVerified: true,
      isActive: true
    });
    console.log('✅ Admin user created');

    console.log('\n🎉 Database completely recreated!');
    console.log('📋 What was created:');
    console.log('   ✅ Fresh road_damage_db database');
    console.log('   ✅ users table with proper schema');
    console.log('   ✅ reports table with proper schema');
    console.log('   ✅ All relationships and constraints');
    console.log('   ✅ Admin user account');
    
    console.log('\n🔐 Admin Login:');
    console.log('   Email: admin@roadfix.com');
    console.log('   Password: admin123');
    console.log('   Type: Administrator');
    
    console.log('\n🚀 You can now restart the backend server!');
    
  } catch (error) {
    console.error('❌ Error recreating database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 MySQL Connection Issue:');
      console.log('1. Make sure XAMPP is running');
      console.log('2. Start MySQL service in XAMPP');
      console.log('3. Check if MySQL is running on port 3306');
    } else {
      console.log('\n🛠️ Manual Alternative:');
      console.log('1. Open XAMPP phpMyAdmin');
      console.log('2. Drop road_damage_db database completely');
      console.log('3. Create new road_damage_db database');
      console.log('4. Run this script again');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

recreateDatabase();