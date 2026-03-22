const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createMunicipalUser() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'road_damage_db'
  });
  
  try {
    // Create test municipal user
    const municipalPassword = await bcrypt.hash('municipal123', 10);
    await conn.execute(`
      INSERT INTO users (firstName, lastName, email, password, userType, ward, isActive, isEmailVerified, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
      password = VALUES(password),
      isActive = 1,
      isEmailVerified = 1
    `, ['Municipal', 'Officer', 'testmunicipal@example.com', municipalPassword, 'municipal', 'Ward 5 - South Central', 1, 1]);
    
    console.log('✅ Test municipal user created/updated');
    
    // Verify user exists
    const [users] = await conn.execute('SELECT id, firstName, lastName, email, userType, ward FROM users WHERE email = ?', ['testmunicipal@example.com']);
    console.log('Municipal user details:', users[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

createMunicipalUser();