const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'road_damage_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    await connection.end();
    console.log('✅ Database setup complete!');
    console.log('💡 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    console.log('💡 Make sure XAMPP MySQL is running');
    console.log('💡 Check your database credentials in .env file');
  }
}

createDatabase();