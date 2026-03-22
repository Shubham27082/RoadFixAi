const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sequelize } = require('./config/database');

async function debugUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find the citizen user
    const user = await User.findOne({ where: { email: 'john@example.com' } });
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- UserType:', user.userType);
      console.log('- IsEmailVerified:', user.isEmailVerified);
      console.log('- IsActive:', user.isActive);
      console.log('- Password hash length:', user.password?.length);
      
      // Test password comparison
      const testPassword = 'password123';
      const isValid = await user.comparePassword(testPassword);
      console.log('- Password comparison result:', isValid);
      
      // Test manual bcrypt comparison
      const manualCheck = await bcrypt.compare(testPassword, user.password);
      console.log('- Manual bcrypt comparison:', manualCheck);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugUser();