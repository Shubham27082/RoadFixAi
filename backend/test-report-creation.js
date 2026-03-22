const fetch = require('node-fetch');

async function testReportCreation() {
  try {
    console.log('🔄 Testing report creation...');
    
    // Test login first
    console.log('1️⃣ Testing login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testcitizen@example.com',
        password: 'password123',
        userType: 'citizen'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login result:', loginData.success ? '✅ Success' : '❌ ' + loginData.message);
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }
    
    // Test report creation
    console.log('2️⃣ Testing report creation...');
    const reportRes = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationAddress: 'Test Road, Bangalore, Karnataka',
        state: 'Karnataka',
        district: 'Bangalore Urban',
        city: 'Bangalore',
        damageType: 'Pothole',
        severity: 'high',
        description: 'Test report creation',
        aiAnalysis: { 
          confidence: 95, 
          damageType: 'Pothole', 
          severity: 'High',
          estimatedCost: '₹15000',
          estimatedRepairTime: '2-3 Days'
        },
        priority: 'High'
      })
    });
    
    const reportData = await reportRes.json();
    console.log('Report creation result:', reportData.success ? '✅ Success - ' + reportData.data.complaintId : '❌ ' + reportData.message);
    
    if (reportData.success) {
      console.log('✅ Report creation is working properly!');
      console.log('📋 Complaint ID:', reportData.data.complaintId);
    } else {
      console.log('❌ Report creation failed:', reportData.message);
      if (reportData.errors) {
        console.log('Errors:', reportData.errors);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testReportCreation();