const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

async function testStoredHash() {
  try {
    console.log('🔧 Testing Stored Hash...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get the hash directly from database
    const [results] = await sequelize.query(
      "SELECT password FROM users WHERE email = 'test.municipal@example.com'"
    );

    if (results.length > 0) {
      const storedHash = results[0].password;
      console.log(`Stored hash from DB: ${storedHash}`);
      console.log(`Hash length: ${storedHash.length}`);

      const testPassword = 'test123';
      console.log(`Testing password: ${testPassword}`);

      // Test comparison
      const isValid = await bcrypt.compare(testPassword, storedHash);
      console.log(`Comparison result: ${isValid}`);

      // Create a fresh hash and compare
      const freshHash = await bcrypt.hash(testPassword, 12);
      console.log(`\nFresh hash: ${freshHash}`);
      const freshTest = await bcrypt.compare(testPassword, freshHash);
      console.log(`Fresh hash test: ${freshTest}`);

      // Update the database with the fresh hash
      await sequelize.query(
        "UPDATE users SET password = ? WHERE email = 'test.municipal@example.com'",
        { replacements: [freshHash] }
      );
      console.log('\n✅ Password updated in database with fresh hash');

    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testStoredHash();