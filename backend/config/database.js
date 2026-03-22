const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'road_damage_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // Increase packet size for image uploads
      maxAllowedPacket: 16777216, // 16MB
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    return false;
  }
};

// Initialize database (create tables)
const initDatabase = async () => {
  try {
    // Import models to register them
    const User = require('../models/User');
    const Report = require('../models/Report');
    
    // Sync all models (associations are handled in models/index.js)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase
};