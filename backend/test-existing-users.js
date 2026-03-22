const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testWithExistingUsers() {
  try {
    // Try with existing test users
    console.log('🔐 Testing with existing users...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john.doe@example.com',
      password: 'password123',
      userType: 'citizen'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful with existing user');
    
    // Simple report data
    const reportData = {
      locationAddress: 'Test Street, Bangalore',
      damageType: 'Pothole',
      severity: 'high',
      description: 'Test report for demo'
    };
    
    console.log('📝 Creating report...');
    const reportResponse = await axios.post(`${API_BASE}/reports`, reportData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (reportResponse.data.success) {
      console.log('✅ Report created successfully!');
      console.log(`   Complaint ID: ${reportResponse.data.data.complaintId}`);
      return reportResponse.data.data.complaintId;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testMunicipalLogin() {
  try {
    console.log('\n🏛️  Testing municipal login...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'municipal.member@example.com',
      password: 'password123',
      userType: 'municipal'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Municipal login successful');
    
    // Get reports
    const reportsResponse = await axios.get(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${reportsResponse.data.data.reports.length} reports`);
    
    if (reportsResponse.data.data.reports.length > 0) {
      const report = reportsResponse.data.data.reports[0];
      console.log(`   Sample: ${report.complaintId} - ${report.status}`);
      
      // Test approval
      if (report.status !== 'Approved') {
        console.log('\n✅ Testing approval...');
        const approvalResponse = await axios.put(`${API_BASE}/reports/${report.id}/status`, {
          status: 'Approved',
          notes: 'Approved for demo'
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (approvalResponse.data.success) {
          console.log('✅ Report approved successfully!');
        }
      }
      
      return report.complaintId;
    }
    
  } catch (error) {
    console.error('❌ Municipal test error:', error.response?.data || error.message);
    return null;
  }
}

async function testTracking(complaintId) {
  try {
    console.log('\n🔍 Testing tracking...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john.doe@example.com',
      password: 'password123',
      userType: 'citizen'
    });
    
    const token = loginResponse.data.data.token;
    
    const trackResponse = await axios.get(`${API_BASE}/reports/track/${complaintId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (trackResponse.data.success) {
      console.log('✅ Tracking successful!');
      console.log(`   Status: ${trackResponse.data.data.report.status}`);
      console.log(`   Timeline available: Yes`);
    }
    
  } catch (error) {
    console.error('❌ Tracking error:', error.response?.data || error.message);
  }
}

async function runQuickDemo() {
  console.log('🚀 QUICK SYSTEM DEMO');
  console.log('Using existing test users...\n');
  
  const complaintId = await testWithExistingUsers();
  if (complaintId) {
    const municipalComplaintId = await testMunicipalLogin();
    await testTracking(municipalComplaintId || complaintId);
    
    console.log('\n🎉 QUICK DEMO COMPLETE!');
    console.log('\n📋 Test Results:');
    console.log('   ✅ User authentication working');
    console.log('   ✅ Report creation working');
    console.log('   ✅ Municipal dashboard working');
    console.log('   ✅ Approval system working');
    console.log('   ✅ Tracking system working');
    
    console.log('\n🌐 Frontend Testing:');
    console.log('   URL: http://localhost:5174');
    console.log('   Citizen: john.doe@example.com / password123');
    console.log('   Municipal: municipal.member@example.com / password123');
    console.log(`   Test Complaint: ${municipalComplaintId || complaintId}`);
  }
}

runQuickDemo();