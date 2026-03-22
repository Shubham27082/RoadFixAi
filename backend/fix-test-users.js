const User = require('./models/User');

async function fixTestUsers() {
  try {
    console.log('🔧 Fixing test users...\n');

    // Update all test users with correct ward enum value
    const users = await User.findAll({
      where: {
        email: ['john.doe@example.com', 'municipal.member@example.com', 'ward.officer@example.com']
      }
    });

    for (const user of users) {
      await user.update({ ward: 'Ward 5 - South Central' });
      console.log(`✅ Updated ${user.email} with Ward 5 - South Central`);
    }

    console.log('\n🎉 All users updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixTestUsers();