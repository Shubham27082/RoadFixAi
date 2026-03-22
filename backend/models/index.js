const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Report = require('./Report');

// Store models in an object for easy access
const models = {
  User,
  Report
};

// Initialize associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  models,
  syncDatabase,
  ...models
};