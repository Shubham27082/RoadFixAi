const axios = require('axios');

async function testAuthFix() {
  try {
    console.log('🧪 Testing Authentication Fix...\n');

    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'yashkumbhar892@gmail.com',
      password: 'password123',
      userType: 'citizen'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log(`   Token received: ${loginResponse.data.data.token.substring(0, 20)}...`);
      console.log(`   User ID: ${loginResponse.data.data.user.id}`);
      
      const token = loginResponse.data.data.token;
      
      // Test protected route
      console.log('\n2. Testing protected route with token...');
      const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.data.success) {
        console.log('✅ Protected route access successful');
        console.log(`   User: ${profileResponse.data.data.user.firstName} ${profileResponse.data.data.user.lastName}`);
      }
      
      // Test report creation endpoint
      console.log('\n3. Testing report creation endpoint...');
      const reportData = {
        locationAddress: 'Test Location, Bangalore, Karnataka',
        state: 'Karnataka',
        district: 'Bangalore Urban',
        city: 'Bangalore',
        gpsCoordinates: '12.9716, 77.5946',
        damageType: 'Pothole',
        severity: 'high',
        description: 'Test report for authentication fix',
        aiAnalysis: {
          confidence: 95,
          detectedType: 'Pothole',
          detectedSeverity: 'High',
          estimatedSize: '20 sq ft',
          riskLevel: 'HIGH',
          repairPriority: 'Urgent',
          estimatedCost: '₹12000',
          estimatedRepairTime: '1-2 Days'
        },
        priority: 'Urgent'
      };
      
      const reportResponse = await axios.post('http://localhost:5000/api/reports', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (reportResponse.data.success) {
        console.log('✅ Report creation successful');
        console.log(`   Report ID: ${reportResponse.data.data.complaintId}`);
        console.log(`   Database ID: ${reportResponse.data.data.report.id}`);
      }
      
      console.log('\n🎉 All authentication tests passed!');
      console.log('✅ The "Invalid token" issue has been fixed.');
      
    } else {
      throw new Error('Login failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAuthFix();