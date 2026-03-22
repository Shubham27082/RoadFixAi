const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function createTestReportWithAI() {
  console.log('Creating test report with AI analysis data...');
  
  try {
    // Login as citizen first
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.citizen@example.com',
        password: 'demo123',
        userType: 'citizen'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.log('❌ Login failed:', loginResult.message);
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Logged in as citizen');
    
    // Create report with comprehensive AI analysis
    const reportData = {
      locationAddress: 'MG Road, Bangalore Urban, Karnataka',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      city: 'Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      gpsCoordinates: '12.9716, 77.5946',
      damageType: 'Pothole',
      severity: 'high',
      description: 'Large pothole causing severe traffic disruption and vehicle damage',
      priority: 'High',
      aiAnalysis: {
        confidence: 94,
        estimatedCost: '₹18,500',
        estimatedRepairTime: '2-3 Days',
        damageArea: '3.2 sq meters',
        riskLevel: 'High',
        trafficImpact: 'Severe',
        weatherResistance: 'Low',
        repairComplexity: 'Medium',
        materialRequired: 'Asphalt, Gravel, Sealant',
        equipmentNeeded: 'Compactor, Roller, Hot Mix Plant'
      }
    };
    
    const reportResponse = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });
    
    const reportResult = await reportResponse.json();
    
    if (reportResult.success) {
      console.log('✅ Test report created successfully');
      console.log(`   Complaint ID: ${reportResult.data.complaintId}`);
      console.log(`   Report ID: ${reportResult.data.report.id}`);
      console.log('   AI Analysis included:');
      console.log(`   - Confidence: ${reportData.aiAnalysis.confidence}%`);
      console.log(`   - Est. Cost: ${reportData.aiAnalysis.estimatedCost}`);
      console.log(`   - Est. Time: ${reportData.aiAnalysis.estimatedRepairTime}`);
      console.log(`   - Damage Area: ${reportData.aiAnalysis.damageArea}`);
      console.log(`   - Risk Level: ${reportData.aiAnalysis.riskLevel}`);
    } else {
      console.log('❌ Report creation failed:', reportResult.message);
      if (reportResult.errors) {
        console.log('   Errors:', reportResult.errors);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestReportWithAI();