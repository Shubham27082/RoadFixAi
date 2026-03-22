const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const MUNICIPAL_USER = {
  email: 'municipal@roadfix.com',
  password: 'municipal123',
  userType: 'municipal'
};

const CITIZEN_USER = {
  email: 'john@example.com',
  password: 'password123',
  userType: 'citizen'
};

let municipalToken = '';
let citizenToken = '';
let testReportId = '';

async function login(credentials) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function createTestReport(token) {
  try {
    const reportData = {
      locationAddress: 'Test Road, Bangalore Urban, Karnataka',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      city: 'Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      damageType: 'Pothole',
      severity: 'high',
      description: 'Test pothole for status update testing',
      aiAnalysis: {
        confidence: 95,
        estimatedCost: '₹10000',
        estimatedRepairTime: '2-3 Days'
      },
      priority: 'High'
    };

    const response = await axios.post(`${API_BASE}/reports`, reportData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.data.report.id;
  } catch (error) {
    console.error('Failed to create test report:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testMunicipalAction(reportId, action, token) {
  try {
    console.log(`\n🔄 Testing municipal action: ${action}`);
    
    const response = await axios.put(
      `${API_BASE}/reports/${reportId}/municipal-action`,
      { action, notes: `Testing ${action} action` },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      const newStatus = response.data.data.report.status;
      console.log(`✅ ${action} successful - New status: ${newStatus || 'undefined'}`);
      
      if (!newStatus) {
        console.log('⚠️ Warning: Status is undefined in response');
        console.log('Full response:', JSON.stringify(response.data, null, 2));
      }
      
      return newStatus || 'Unknown';
    } else {
      console.log(`❌ ${action} failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ ${action} error:`, error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error response:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testTrackComplaint(complaintId, token) {
  try {
    console.log(`\n🔍 Testing track complaint: ${complaintId}`);
    
    const response = await axios.get(`${API_BASE}/reports/track/${complaintId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      const report = response.data.data.report;
      console.log(`✅ Track complaint successful - Status: ${report.status}`);
      console.log(`📋 Timeline entries: ${response.data.data.timeline?.length || 0}`);
      return report.status;
    } else {
      console.log(`❌ Track complaint failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Track complaint error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testStats(token) {
  try {
    console.log(`\n📊 Testing stats API`);
    
    const response = await axios.get(`${API_BASE}/reports/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      const stats = response.data.data;
      console.log(`✅ Stats successful:`);
      console.log(`   Total Reports: ${stats.totalReports}`);
      console.log(`   Pending: ${stats.pendingReports}`);
      console.log(`   Approved: ${stats.approvedReports}`);
      console.log(`   Completed: ${stats.completedReports}`);
      
      if (stats.workflow) {
        console.log(`   Workflow breakdown:`);
        console.log(`     Submitted: ${stats.workflow.submitted}`);
        console.log(`     Under Review: ${stats.workflow.underReview}`);
        console.log(`     Approved: ${stats.workflow.approved}`);
        console.log(`     Assigned: ${stats.workflow.assigned}`);
        console.log(`     In Progress: ${stats.workflow.inProgress}`);
        console.log(`     Completed: ${stats.workflow.completed}`);
        console.log(`     Closed: ${stats.workflow.closed}`);
      }
      
      return stats;
    } else {
      console.log(`❌ Stats failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Stats error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function runStatusUpdateTest() {
  console.log('🚀 Starting comprehensive status update test...\n');

  // Step 1: Login as citizen and municipal user
  console.log('👤 Logging in users...');
  citizenToken = await login(CITIZEN_USER);
  municipalToken = await login(MUNICIPAL_USER);

  if (!citizenToken || !municipalToken) {
    console.error('❌ Failed to login users. Exiting test.');
    return;
  }
  console.log('✅ Both users logged in successfully');

  // Step 2: Create a test report as citizen
  console.log('\n📝 Creating test report...');
  testReportId = await createTestReport(citizenToken);
  
  if (!testReportId) {
    console.error('❌ Failed to create test report. Exiting test.');
    return;
  }
  console.log(`✅ Test report created with ID: ${testReportId}`);

  // Get the complaint ID for tracking
  const reportsResponse = await axios.get(`${API_BASE}/reports/my-reports`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  const complaintId = reportsResponse.data.data.reports[0]?.complaintId;
  
  if (!complaintId) {
    console.error('❌ Failed to get complaint ID. Exiting test.');
    return;
  }
  console.log(`📋 Complaint ID: ${complaintId}`);

  // Step 3: Test initial stats
  await testStats(municipalToken);

  // Step 4: Test sequential workflow
  const workflowActions = ['approve', 'assign', 'start-work', 'resolved', 'closed'];
  
  for (const action of workflowActions) {
    // Test municipal action
    const newStatus = await testMunicipalAction(testReportId, action, municipalToken);
    
    if (newStatus) {
      // Test tracking after each action
      await testTrackComplaint(complaintId, citizenToken);
      
      // Test stats after each action
      await testStats(municipalToken);
      
      // Wait a moment between actions
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`⚠️ Skipping remaining actions due to ${action} failure`);
      break;
    }
  }

  console.log('\n🎉 Status update test completed!');
  console.log('\n📋 Summary:');
  console.log('✅ All status updates should be synchronized across:');
  console.log('   - TrackComplaint page (citizen view)');
  console.log('   - MemberDashboard page (municipal view)');
  console.log('   - AdminDashboard page (admin view)');
  console.log('   - Stats API (real-time counts)');
}

// Run the test
runStatusUpdateTest().catch(console.error);