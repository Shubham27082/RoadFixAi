const { testConnection } = require('./config/database');
const { sequelize } = require('./config/database');

async function fixResetTokenLength() {
  console.log('🔧 Fixing password reset token field length...\n');

  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Database not connected');
      return;
    }

    // Update the column length
    await sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN passwordResetToken VARCHAR(64)
    `);

    console.log('✅ Successfully updated passwordResetToken field to VARCHAR(64)');
    
    // Clear existing short tokens since they're invalid
    await sequelize.query(`
      UPDATE users 
      SET passwordResetToken = NULL, passwordResetExpires = NULL 
      WHERE passwordResetToken IS NOT NULL
    `);

    console.log('✅ Cleared existing invalid reset tokens');
    console.log('💡 Users will need to request new password reset links');

  } catch (error) {
    console.error('❌ Error updating database:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixResetTokenLength();