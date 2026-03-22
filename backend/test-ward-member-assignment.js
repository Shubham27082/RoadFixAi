const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testWardMemberAssignment() {
  try {
    console.log('🧪 Testing Ward Member Assignment Feature...\n');

    // Test login first
    console.log('1. Logging in as test user...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'shubham27052002@gmail.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log(`✅ Logged in as: ${user.firstName} ${user.lastName} (${user.ward})`);

    // Test fetching ward members
    console.log('\n2. Fetching ward members...');
    const wardMembersResponse = await axios.get(
      `${API_URL}/api/reports/ward-members/${encodeURIComponent(user.ward)}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (wardMembersResponse.data.success) {
      const wardMembers = wardMembersResponse.data.data.wardMembers;
      console.log(`✅ Found ${wardMembers.length} ward members:`);
      wardMembers.forEach(member => {
        console.log(`   - ${member.name} (${member.email})`);
      });

      // Test creating report with ward member assignment
      if (wardMembers.length > 0) {
        console.log('\n3. Creating report with ward member assignment...');
        const reportData = {
          locationAddress: 'Test Road, Bengaluru, Karnataka',
          state: 'Karnataka',
          district: 'Bengaluru Urban',
          city: 'Bengaluru',
          damageType: 'Pothole',
          severity: 'medium',
          description: 'Test report with ward member assignment',
          priority: 'Medium',
          sendToWard: true,
          assignedTo: wardMembers[0].id,
          aiAnalysis: {
            confidence: 85,
            damageType: 'Pothole',
            severity: 'Medium',
            estimatedCost: '₹15000',
            estimatedRepairTime: '3-5 Days'
          }
        };

        const reportResponse = await axios.post(`${API_URL}/api/reports`, reportData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (reportResponse.data.success) {
          const report = reportResponse.data.data.report;
          console.log(`✅ Report created successfully!`);
          console.log(`   - Complaint ID: ${reportResponse.data.data.complaintId}`);
          console.log(`   - Status: ${report.status}`);
          console.log(`   - Assigned To ID: ${report.assignedToId}`);
          console.log(`   - Ward Member: ${wardMembers[0].name}`);
        } else {
          console.log('❌ Failed to create report:', reportResponse.data.message);
        }
      } else {
        console.log('⚠️  No ward members found, testing without assignment...');
        
        const reportData = {
          locationAddress: 'Test Road, Bengaluru, Karnataka',
          state: 'Karnataka',
          district: 'Bengaluru Urban',
          city: 'Bengaluru',
          damageType: 'Pothole',
          severity: 'medium',
          description: 'Test report without ward member assignment',
          priority: 'Medium',
          sendToWard: false,
          aiAnalysis: {
            confidence: 85,
            damageType: 'Pothole',
            severity: 'Medium',
            estimatedCost: '₹15000',
            estimatedRepairTime: '3-5 Days'
          }
        };

        const reportResponse = await axios.post(`${API_URL}/api/reports`, reportData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (reportResponse.data.success) {
          console.log(`✅ Report created successfully without assignment!`);
          console.log(`   - Complaint ID: ${reportResponse.data.data.complaintId}`);
          console.log(`   - Status: ${reportResponse.data.data.report.status}`);
        }
      }
    } else {
      console.log('❌ Failed to fetch ward members:', wardMembersResponse.data.message);
    }

    console.log('\n🎉 Ward Member Assignment Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testWardMemberAssignment();