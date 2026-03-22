const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testMunicipalReports() {
  try {
    console.log('🧪 Testing Municipal Member Reports Access...\n');

    // Test with municipal member credentials
    console.log('1. Logging in as municipal member...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test.municipal@example.com',
      password: 'test123',
      userType: 'municipal'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log(`✅ Logged in as: ${user.firstName} ${user.lastName}`);
      console.log(`   Ward: ${user.ward}`);
      console.log(`   User Type: ${user.userType}`);

      // Test fetching all reports
      console.log('\n2. Fetching all reports...');
      const allReportsResponse = await axios.get(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (allReportsResponse.data.success) {
        const reports = allReportsResponse.data.data.reports;
        console.log(`✅ Found ${reports.length} reports:`);
        reports.forEach((report, index) => {
          console.log(`   ${index + 1}. ${report.complaintId} - ${report.status} - ${report.damageType}`);
          console.log(`      Location: ${report.locationAddress}`);
          console.log(`      Submitted by: ${report.user?.firstName} ${report.user?.lastName}`);
        });

        // Test approving a report if any exist
        if (reports.length > 0) {
          const reportToApprove = reports[0];
          console.log(`\n3. Testing approval of report: ${reportToApprove.complaintId}`);
          
          const approvalResponse = await axios.put(
            `${API_URL}/api/reports/${reportToApprove.id}/status`,
            {
              status: 'Approved',
              notes: 'Approved during testing'
            },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (approvalResponse.data.success) {
            console.log('✅ Report approved successfully!');
            console.log(`   New status: ${approvalResponse.data.data.report.status}`);
          } else {
            console.log('❌ Approval failed:', approvalResponse.data.message);
          }
        } else {
          console.log('⚠️  No reports found to approve');
        }

      } else {
        console.log('❌ Failed to fetch reports:', allReportsResponse.data.message);
      }

      // Test fetching assigned reports
      console.log('\n4. Fetching assigned reports...');
      const assignedReportsResponse = await axios.get(`${API_URL}/api/reports/assigned-to-me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (assignedReportsResponse.data.success) {
        const assignedReports = assignedReportsResponse.data.data.reports;
        console.log(`✅ Found ${assignedReports.length} assigned reports`);
      } else {
        console.log('❌ Failed to fetch assigned reports:', assignedReportsResponse.data.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

    console.log('\n🎉 Municipal Reports Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMunicipalReports();