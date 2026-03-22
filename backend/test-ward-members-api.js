const axios = require('axios');

async function testWardMembersAPI() {
  try {
    console.log('🧪 Testing Ward Members API...\n');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'municipal@roadfix.gov.in',
      password: 'municipal123',
      userType: 'municipal'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log(`   User: ${user.firstName} ${user.lastName}`);
    console.log(`   Ward: ${user.ward}`);

    // Test ward members API
    console.log('\n2. Fetching ward members...');
    const wardMembersResponse = await axios.get(`http://localhost:5000/api/reports/ward-members/${encodeURIComponent(user.ward)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (wardMembersResponse.data.success) {
      console.log('✅ Ward members fetched successfully!');
      console.log(`📊 Found ${wardMembersResponse.data.data.wardMembers.length} municipal members in ${wardMembersResponse.data.data.ward}`);
      
      wardMembersResponse.data.data.wardMembers.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email})`);
      });
    } else {
      throw new Error('Failed to fetch ward members: ' + wardMembersResponse.data.message);
    }

    // Test with different ward
    console.log('\n3. Testing with Ward 2...');
    const ward2Response = await axios.get(`http://localhost:5000/api/reports/ward-members/${encodeURIComponent('Ward 2 - North District')}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (ward2Response.data.success) {
      console.log('✅ Ward 2 members fetched successfully!');
      console.log(`📊 Found ${ward2Response.data.data.wardMembers.length} municipal members in Ward 2 - North District`);
      
      ward2Response.data.data.wardMembers.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email})`);
      });
    }

    console.log('\n🎉 Ward Members API is working correctly!');
    console.log('✅ The dropdown will now show real municipal members from the database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testWardMembersAPI();