const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testApprovalFunctionality() {
  try {
    console.log('🧪 Testing Report Approval Functionality...\n');

    // First, let's create a test report to approve
    console.log('1. Creating a test report...');
    
    // Login as a citizen first to create a report
    const citizenLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'shubham27052002@gmail.com',
      password: 'password123',
      userType: 'citizen'
    });

    if (citizenLogin.data.success) {
      const citizenToken = citizenLogin.data.data.token;
      console.log('✅ Logged in as citizen');

      // Create a test report
      const reportData = {
        locationAddress: 'Test Road for Approval, Bengaluru, Karnataka',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        city: 'Bengaluru',
        damageType: 'Pothole',
        severity: 'medium',
        description: 'Test report for approval functionality',
        priority: 'Medium',
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
          Authorization: `Bearer ${citizenToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (reportResponse.data.success) {
        const reportId = reportResponse.data.data.report.id;
        const complaintId = reportResponse.data.data.complaintId;
        console.log(`✅ Test report created: ${complaintId} (ID: ${reportId})`);

        // Now login as municipal member to approve the report
        console.log('\n2. Logging in as municipal member...');
        const municipalLogin = await axios.post(`${API_URL}/api/auth/login`, {
          email: 'snehaulvekar08@gmail.com',
          password: 'password123',
          userType: 'municipal'
        });

        if (municipalLogin.data.success) {
          const municipalToken = municipalLogin.data.data.token;
          const municipalUser = municipalLogin.data.data.user;
          console.log(`✅ Logged in as: ${municipalUser.firstName} ${municipalUser.lastName}`);

          // Test approving the report
          console.log('\n3. Testing report approval...');
          const approvalResponse = await axios.put(
            `${API_URL}/api/reports/${reportId}/status`,
            {
              status: 'Approved',
              notes: 'Report approved by municipal member - test functionality'
            },
            {
              headers: { 
                Authorization: `Bearer ${municipalToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (approvalResponse.data.success) {
            console.log('✅ Report approved successfully!');
            console.log(`   - Status: ${approvalResponse.data.data.report.status}`);
            
            // Test rejecting another status
            console.log('\n4. Testing report rejection...');
            const rejectionResponse = await axios.put(
              `${API_URL}/api/reports/${reportId}/status`,
              {
                status: 'Rejected',
                notes: 'Testing rejection functionality'
              },
              {
                headers: { 
                  Authorization: `Bearer ${municipalToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (rejectionResponse.data.success) {
              console.log('✅ Report rejection also works!');
              console.log(`   - Status: ${rejectionResponse.data.data.report.status}`);
            } else {
              console.log('❌ Report rejection failed:', rejectionResponse.data.message);
            }

          } else {
            console.log('❌ Report approval failed:', approvalResponse.data.message);
          }

        } else {
          console.log('❌ Municipal login failed:', municipalLogin.data.message);
        }

      } else {
        console.log('❌ Failed to create test report:', reportResponse.data.message);
      }

    } else {
      console.log('❌ Citizen login failed:', citizenLogin.data.message);
    }

    console.log('\n🎉 Approval Functionality Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testApprovalFunctionality();