const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testFrontendFunctionality() {
  console.log('🔄 Testing Frontend Functionality...\n');

  try {
    // 1. Test citizen login
    console.log('1️⃣ Testing citizen login...');
    const citizenLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testcitizen@example.com',
        password: 'password123',
        userType: 'citizen'
      })
    });

    const citizenLogin = await citizenLoginResponse.json();
    if (!citizenLogin.success) {
      throw new Error('Citizen login failed: ' + citizenLogin.message);
    }

    const citizenToken = citizenLogin.data.token;
    const citizenUser = citizenLogin.data.user;
    console.log(`✅ Citizen logged in: ${citizenUser.firstName} ${citizenUser.lastName} (Ward: ${citizenUser.ward})`);

    // 2. Test ward member fetching
    console.log('\n2️⃣ Testing ward member fetching...');
    const wardMembersResponse = await fetch(`${API_BASE}/reports/ward-members/${encodeURIComponent(citizenUser.ward)}`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });

    const wardMembersResult = await wardMembersResponse.json();
    if (!wardMembersResult.success) {
      throw new Error('Ward members fetch failed: ' + wardMembersResult.message);
    }

    console.log(`✅ Found ${wardMembersResult.data.wardMembers.length} ward members:`);
    wardMembersResult.data.wardMembers.forEach(member => {
      console.log(`   - ${member.firstName} ${member.lastName} - ${member.email} (ID: ${member.id})`);
    });

    // 3. Test municipal login
    console.log('\n3️⃣ Testing municipal login...');
    const municipalLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testmunicipal@example.com',
        password: 'municipal123',
        userType: 'municipal'
      })
    });

    const municipalLogin = await municipalLoginResponse.json();
    if (!municipalLogin.success) {
      throw new Error('Municipal login failed: ' + municipalLogin.message);
    }

    const municipalToken = municipalLogin.data.token;
    const municipalUser = municipalLogin.data.user;
    console.log(`✅ Municipal member logged in: ${municipalUser.firstName} ${municipalUser.lastName} (Ward: ${municipalUser.ward})`);

    // 4. Test report creation with ward member assignment
    console.log('\n4️⃣ Testing report creation with ward member assignment...');
    const selectedWardMember = wardMembersResult.data.wardMembers[0];
    
    const reportData = {
      locationAddress: 'Test Street, Bangalore Urban, Karnataka',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      city: 'Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      gpsCoordinates: '12.9716, 77.5946',
      damageType: 'Pothole',
      severity: 'high',
      description: 'Large pothole causing traffic issues - Frontend Test',
      aiAnalysis: {
        confidence: 92,
        damageType: 'Pothole',
        severity: 'High',
        estimatedCost: '₹20000',
        estimatedRepairTime: '2-3 Days',
        riskLevel: 'High'
      },
      priority: 'High',
      assignedTo: selectedWardMember.id,
      sendToWard: true
    };

    const createReportResponse = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${citizenToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });

    const createReportResult = await createReportResponse.json();
    if (!createReportResult.success) {
      throw new Error('Report creation failed: ' + createReportResult.message);
    }

    const newReport = createReportResult.data.report;
    console.log(`✅ Report created: ${createReportResult.data.complaintId}`);
    console.log(`   Assigned to: ${selectedWardMember.firstName} ${selectedWardMember.lastName}`);
    console.log(`   Status: ${newReport.status}`);

    // 5. Test municipal member viewing reports
    console.log('\n5️⃣ Testing municipal member viewing reports...');
    const reportsResponse = await fetch(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });

    const reportsResult = await reportsResponse.json();
    if (!reportsResult.success) {
      throw new Error('Reports fetch failed: ' + reportsResult.message);
    }

    console.log(`✅ Municipal member can see ${reportsResult.data.reports.length} reports:`);
    reportsResult.data.reports.slice(0, 3).forEach(report => {
      console.log(`   - ${report.complaintId}: ${report.damageType} (${report.severity}) - Status: ${report.status}`);
      console.log(`     Submitted by: ${report.user?.firstName} ${report.user?.lastName} (${report.user?.email})`);
      console.log(`     Location: ${report.locationAddress}`);
    });

    // 6. Test report approval
    console.log('\n6️⃣ Testing report approval...');
    const reportToApprove = reportsResult.data.reports.find(r => r.id === newReport.id);
    
    if (reportToApprove) {
      const approveResponse = await fetch(`${API_BASE}/reports/${reportToApprove.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${municipalToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Approved',
          notes: 'Report approved by municipal member - Frontend Test'
        })
      });

      const approveResult = await approveResponse.json();
      if (!approveResult.success) {
        throw new Error('Report approval failed: ' + approveResult.message);
      }

      console.log(`✅ Report ${reportToApprove.complaintId} approved successfully`);
    }

    // 7. Test report tracking
    console.log('\n7️⃣ Testing report tracking...');
    const trackResponse = await fetch(`${API_BASE}/reports/track/${createReportResult.data.complaintId}`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });

    const trackResult = await trackResponse.json();
    if (!trackResult.success) {
      throw new Error('Report tracking failed: ' + trackResult.message);
    }

    console.log(`✅ Report tracking working for ${createReportResult.data.complaintId}:`);
    console.log(`   Current Status: ${trackResult.data.report.status}`);
    console.log(`   Timeline entries: ${trackResult.data.timeline?.length || 0}`);
    
    if (trackResult.data.timeline && trackResult.data.timeline.length > 0) {
      trackResult.data.timeline.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.status} - ${entry.notes}`);
      });
    }

    // 8. Test stats endpoint
    console.log('\n8️⃣ Testing stats endpoint...');
    const statsResponse = await fetch(`${API_BASE}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${municipalToken}` }
    });

    const statsResult = await statsResponse.json();
    if (!statsResult.success) {
      throw new Error('Stats fetch failed: ' + statsResult.message);
    }

    console.log(`✅ Stats endpoint working:`);
    console.log(`   Total Reports: ${statsResult.data.totalReports}`);
    console.log(`   Pending Reports: ${statsResult.data.pendingReports}`);
    console.log(`   Approved Reports: ${statsResult.data.approvedReports}`);
    console.log(`   Completed Reports: ${statsResult.data.completedReports}`);
    console.log(`   High Priority: ${statsResult.data.highPriority}`);

    console.log('\n✅ All frontend functionality tests passed!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Citizen login working');
    console.log('  ✅ Ward member fetching working');
    console.log('  ✅ Municipal login working');
    console.log('  ✅ Report creation with assignment working');
    console.log('  ✅ Municipal member can view reports');
    console.log('  ✅ Report approval working');
    console.log('  ✅ Report tracking working');
    console.log('  ✅ Stats endpoint working');

  } catch (error) {
    console.error('❌ Error during frontend functionality test:', error.message);
    console.error('Full error:', error);
  }
}

testFrontendFunctionality();