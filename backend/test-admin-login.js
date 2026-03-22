const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testAdminLogin() {
  console.log('🔄 Testing Admin Login...\n');

  try {
    // Test admin login
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@roadfix.com',
        password: 'admin123',
        userType: 'admin'
      })
    });

    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      throw new Error('Admin login failed: ' + loginResult.message);
    }

    const adminToken = loginResult.data.token;
    const adminUser = loginResult.data.user;
    console.log(`✅ Admin logged in successfully:`);
    console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   User Type: ${adminUser.userType}`);
    console.log(`   Ward: ${adminUser.ward}`);

    // Test admin access to reports
    console.log('\n2️⃣ Testing admin access to reports...');
    const reportsResponse = await fetch(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const reportsResult = await reportsResponse.json();
    if (!reportsResult.success) {
      throw new Error('Admin reports access failed: ' + reportsResult.message);
    }

    console.log(`✅ Admin can access ${reportsResult.data.reports.length} reports`);

    // Test admin access to stats
    console.log('\n3️⃣ Testing admin access to stats...');
    const statsResponse = await fetch(`${API_BASE}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const statsResult = await statsResponse.json();
    if (!statsResult.success) {
      throw new Error('Admin stats access failed: ' + statsResult.message);
    }

    console.log(`✅ Admin can access system stats:`);
    console.log(`   Total Reports: ${statsResult.data.totalReports}`);
    console.log(`   Pending Reports: ${statsResult.data.pendingReports}`);
    console.log(`   Approved Reports: ${statsResult.data.approvedReports}`);
    console.log(`   Completed Reports: ${statsResult.data.completedReports}`);
    console.log(`   High Priority: ${statsResult.data.highPriority}`);

    console.log('\n✅ Admin login and access test completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('  📧 Email: admin@roadfix.com');
    console.log('  🔑 Password: admin123');
    console.log('  🌐 Login URL: http://localhost:5174/login');
    console.log('  📊 Dashboard URL: http://localhost:5174/admin');

  } catch (error) {
    console.error('❌ Error during admin login test:', error.message);
  }
}

testAdminLogin();