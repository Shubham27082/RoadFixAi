const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkAdminUser() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'road_damage_db'
  });
  
  try {
    // Check if admin exists
    const [admins] = await conn.execute('SELECT id, firstName, lastName, email, userType FROM users WHERE userType = ?', ['admin']);
    console.log('Current admin users:', admins);
    
    if (admins.length === 0) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await conn.execute(`
        INSERT INTO users (firstName, lastName, email, password, userType, ward, isActive, isEmailVerified, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, ['Admin', 'User', 'admin@roadfix.com', hashedPassword, 'admin', 'Ward 1 - Downtown', 1, 1]);
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Show final admin users
    const [finalAdmins] = await conn.execute('SELECT id, firstName, lastName, email, userType, isActive FROM users WHERE userType = ?', ['admin']);
    console.log('\n📋 Admin users available:');
    finalAdmins.forEach(admin => {
      console.log(`  📧 Email: ${admin.email}`);
      console.log(`  👤 Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`  ✅ Active: ${admin.isActive ? 'Yes' : 'No'}`);
      console.log('  🔑 Password: admin123');
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkAdminUser();