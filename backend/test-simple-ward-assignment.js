const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testSimpleWardAssignment() {
  try {
    console.log('🧪 Testing Ward Member Assignment Feature (Simple)...\n');

    // Test with the municipal user credentials
    console.log('1. Testing with municipal user login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'snehaulvekar08@gmail.com',
      password: 'password123',
      userType: 'municipal'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log(`✅ Logged in as: ${user.firstName} ${user.lastName} (${user.userType})`);
      console.log(`   Ward: ${user.ward || 'No ward assigned'}`);

      // Test fetching ward members for this user's ward
      if (user.ward) {
        console.log('\n2. Fetching ward members...');
        const wardMembersResponse = await axios.get(
          `${API_URL}/api/reports/ward-members/${encodeURIComponent(user.ward)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (wardMembersResponse.data.success) {
          const wardMembers = wardMembersResponse.data.data.wardMembers;
          console.log(`✅ Found ${wardMembers.length} ward members in ${user.ward}:`);
          wardMembers.forEach(member => {
            console.log(`   - ${member.name} (${member.email})`);
          });
        } else {
          console.log('❌ Failed to fetch ward members:', wardMembersResponse.data.message);
        }
      } else {
        console.log('⚠️  User has no ward assigned');
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

    console.log('\n🎉 Simple Ward Assignment Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSimpleWardAssignment();