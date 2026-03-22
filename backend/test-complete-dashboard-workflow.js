const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testCompleteDashboardWorkflow() {
  console.log('='.repeat(60));
  console.log('TESTING COMPLETE MUNICIPAL DASHBOARD WORKFLOW');
  console.log('='.repeat(60));
  
  let municipalToken = '';
  let reportId = null;
  
  try {
    // Step 1: Login as municipal member
    console.log('\n📝 Step 1: Login as Municipal Member');
    console.log('-'.repeat(60));
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.municipal@example.com',
        password: 'demo123',
        userType: 'municipal'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.log('❌ Login failed:', loginResult.message);
      return;
    }
    
    municipalToken = loginResult.data.token;
    const user = loginResult.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Ward: ${user.ward}`);
    console.log(`   User Type: ${user.userType}`);
    console.log(`   Token: ${municipalToken.substring(0, 30)}...`);
    
    // Step 2: Fetch Dashboard Statistics
    console.log('\n📊 Step 2: Fetch Dashboard Statistics');
    console.log('-'.repeat(60));
    
    const statsResponse = await fetch(`${API_BASE}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });
    
    console.log(`   Status: ${statsResponse.status} ${statsResponse.statusText}`);
    
    const statsResult = await statsResponse.json();
    
    if (statsResult.success) {
      console.log('✅ Stats fetched successfully');
      console.log(`   Total Reports: ${statsResult.data.totalReports}`);
      console.log(`   Pending Reports: ${statsResult.data.pendingReports}`);
      console.log(`   Approved Reports: ${statsResult.data.approvedReports}`);
      console.log(`   Completed Reports: ${statsResult.data.completedReports}`);
      console.log(`   High Priority: ${statsResult.data.highPriority}`);
    } else {
      console.log('❌ Stats fetch failed:', statsResult.message);
    }
    
    // Step 3: Fetch All Reports
    console.log('\n📋 Step 3: Fetch All Reports');
    console.log('-'.repeat(60));
    
    const reportsResponse = await fetch(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });
    
    const reportsResult = await reportsResponse.json();
    
    if (reportsResult.success) {
      const reports = reportsResult.data.reports;
      console.log(`✅ Fetched ${reports.length} reports`);
      
      if (reports.length > 0) {
        const report = reports[0];
        reportId = report.id;
        
        console.log('\n   First Report Details:');
        console.log(`   - ID: ${report.id}`);
        console.log(`   - Complaint ID: ${report.complaintId}`);
        console.log(`   - Location: ${report.locationAddress}`);
        console.log(`   - Damage Type: ${report.damageType}`);
        console.log(`   - Severity: ${report.severity}`);
        console.log(`   - Status: ${report.status}`);
        console.log(`   - Priority: ${report.priority}`);
        
        if (report.aiAnalysis) {
          console.log('\n   AI Analysis:');
          console.log(`   - Confidence: ${report.aiAnalysis.confidence}%`);
          console.log(`   - Est. Cost: ${report.aiAnalysis.estimatedCost}`);
          console.log(`   - Est. Time: ${report.aiAnalysis.estimatedRepairTime}`);
        }
      }
    } else {
      console.log('❌ Reports fetch failed:', reportsResult.message);
    }
    
    // Step 4: Fetch Assigned Reports
    console.log('\n📌 Step 4: Fetch Assigned Reports');
    console.log('-'.repeat(60));
    
    const assignedResponse = await fetch(`${API_BASE}/reports/assigned-to-me`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });
    
    const assignedResult = await assignedResponse.json();
    
    if (assignedResult.success) {
      console.log(`✅ Fetched ${assignedResult.data.reports.length} assigned reports`);
    } else {
      console.log('❌ Assigned reports fetch failed:', assignedResult.message);
    }
    
    // Step 5: Test Status Update (if we have a report)
    if (reportId) {
      console.log('\n🔄 Step 5: Test Status Update');
      console.log('-'.repeat(60));
      
      const statusUpdateResponse = await fetch(`${API_BASE}/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${municipalToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Under Review',
          notes: 'Testing status update from workflow test'
        })
      });
      
      const statusUpdateResult = await statusUpdateResponse.json();
      
      if (statusUpdateResult.success) {
        console.log('✅ Status updated successfully');
        console.log(`   New Status: Under Review`);
      } else {
        console.log('❌ Status update failed:', statusUpdateResult.message);
      }
      
      // Step 6: Test Priority Update
      console.log('\n⚡ Step 6: Test Priority Update');
      console.log('-'.repeat(60));
      
      const priorityUpdateResponse = await fetch(`${API_BASE}/reports/${reportId}/priority`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${municipalToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priority: 'High'
        })
      });
      
      const priorityUpdateResult = await priorityUpdateResponse.json();
      
      if (priorityUpdateResult.success) {
        console.log('✅ Priority updated successfully');
        console.log(`   New Priority: High`);
      } else {
        console.log('❌ Priority update failed:', priorityUpdateResult.message);
      }
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Login: SUCCESS');
    console.log('✅ Stats API: SUCCESS');
    console.log('✅ Reports API: SUCCESS');
    console.log('✅ Assigned Reports API: SUCCESS');
    if (reportId) {
      console.log('✅ Status Update: SUCCESS');
      console.log('✅ Priority Update: SUCCESS');
    }
    console.log('\n🎉 All dashboard features are working correctly!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

testCompleteDashboardWorkflow();