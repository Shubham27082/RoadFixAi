const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sequelize } = require('./config/database');

async function fixUserPasswords() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Update citizen user password
    const citizenPassword = await bcrypt.hash('password123', 10);
    const citizen = await User.findOne({ where: { email: 'john@example.com' } });
    if (citizen) {
      await citizen.update({ password: citizenPassword });
      console.log('✅ Citizen password updated: john@example.com / password123');
    } else {
      console.log('❌ Citizen user not found');
    }

    // Update municipal user password
    const municipalPassword = await bcrypt.hash('municipal123', 10);
    const municipal = await User.findOne({ where: { email: 'municipal@roadfix.com' } });
    if (municipal) {
      await municipal.update({ password: municipalPassword });
      console.log('✅ Municipal password updated: municipal@roadfix.com / municipal123');
    } else {
      console.log('❌ Municipal user not found');
    }

    console.log('\n🎉 User passwords fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    process.exit(0);
  }
}

fixUserPasswords();