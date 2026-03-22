const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSimpleTracking() {
  console.log('🔧 Simple Tracking Test');
  console.log('=' .repeat(30));

  try {
    // Login as citizen
    console.log('\n1. 🔐 Logging in as citizen...');
    const citizenLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john.doe@example.com',
      password: 'password123',
      userType: 'citizen'
    });
    const citizenToken = citizenLogin.data.data.token;
    console.log('✅ Citizen logged in successfully');

    // Get existing reports
    console.log('\n2. 📋 Getting existing reports...');
    const reportsResponse = await axios.get(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    
    console.log(`✅ Found ${reportsResponse.data.data.reports.length} reports`);
    
    if (reportsResponse.data.data.reports.length > 0) {
      const firstReport = reportsResponse.data.data.reports[0];
      console.log(`   First report: ${firstReport.complaintId} - ${firstReport.status}`);
      
      // Test tracking with existing report
      console.log('\n3. 🔍 Testing tracking with existing report...');
      const trackResponse = await axios.get(`${API_BASE}/reports/track/${firstReport.complaintId}`, {
        headers: { 'Authorization': `Bearer ${citizenToken}` }
      });
      
      console.log('✅ Tracking successful');
      console.log(`   Status: ${trackResponse.data.data.report.status}`);
      console.log(`   Timeline type: ${typeof trackResponse.data.data.timeline}`);
      console.log(`   Timeline length: ${Array.isArray(trackResponse.data.data.timeline) ? trackResponse.data.data.timeline.length : 'Not an array'}`);
      
      if (Array.isArray(trackResponse.data.data.timeline)) {
        console.log('\n📋 Timeline entries:');
        trackResponse.data.data.timeline.forEach((entry, index) => {
          console.log(`   ${index + 1}. ${entry.status} - ${entry.notes || 'No notes'}`);
        });
      } else {
        console.log('\n⚠️  Timeline is not an array:', trackResponse.data.data.timeline);
      }
      
      return firstReport.complaintId;
    } else {
      console.log('⚠️  No existing reports found');
      return null;
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

async function testMunicipalApproval() {
  console.log('\n\n🏛️  Municipal Approval Test');
  console.log('=' .repeat(30));

  try {
    // Login as municipal member
    console.log('\n1. 🔐 Logging in as municipal member...');
    const municipalLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'municipal.member@example.com',
      password: 'password123',
      userType: 'municipal'
    });
    const municipalToken = municipalLogin.data.data.token;
    console.log('✅ Municipal member logged in successfully');

    // Get assigned reports
    console.log('\n2. 📋 Getting assigned reports...');
    const assignedResponse = await axios.get(`${API_BASE}/reports/assigned-to-me`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });
    
    console.log(`✅ Found ${assignedResponse.data.data.reports.length} assigned reports`);
    
    // Get all reports for municipal member
    console.log('\n3. 📋 Getting all reports for municipal member...');
    const allReportsResponse = await axios.get(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });
    
    console.log(`✅ Found ${allReportsResponse.data.data.reports.length} total reports`);
    
    if (allReportsResponse.data.data.reports.length > 0) {
      const firstReport = allReportsResponse.data.data.reports[0];
      console.log(`   First report: ${firstReport.complaintId} - ${firstReport.status}`);
      
      // Test status update
      if (firstReport.status !== 'Approved' && firstReport.status !== 'Completed') {
        console.log('\n4. ✅ Testing approval...');
        const updateResponse = await axios.put(`${API_BASE}/reports/${firstReport.id}/status`, {
          status: 'Approved',
          notes: 'Report approved by municipal member - testing'
        }, {
          headers: { 'Authorization': `Bearer ${municipalToken}` }
        });
        
        if (updateResponse.data.success) {
          console.log('✅ Status updated to Approved');
          return firstReport.complaintId;
        } else {
          console.log('❌ Failed to update status:', updateResponse.data.message);
        }
      } else {
        console.log(`   Report already ${firstReport.status}`);
        return firstReport.complaintId;
      }
    }

  } catch (error) {
    console.error('\n❌ Municipal test failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
  const complaintId = await testSimpleTracking();
  
  if (complaintId) {
    const updatedComplaintId = await testMunicipalApproval();
    
    if (updatedComplaintId) {
      console.log('\n\n🎉 All Tests Completed!');
      console.log(`\n🔗 Test this complaint ID in the frontend: ${updatedComplaintId}`);
      console.log('\n📋 What to test in the frontend:');
      console.log('   1. Login as citizen (john.doe@example.com / password123)');
      console.log('   2. Go to "Track Complaint" page');
      console.log(`   3. Enter complaint ID: ${updatedComplaintId}`);
      console.log('   4. Verify timeline shows status changes');
      console.log('   5. Login as municipal member (municipal.member@example.com / password123)');
      console.log('   6. Go to Municipal Dashboard → Reports');
      console.log('   7. Test approve/reject buttons');
      console.log('   8. Test export PDF functionality');
    }
  }
}

runTests();