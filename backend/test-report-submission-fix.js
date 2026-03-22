const axios = require('axios');

async function testReportSubmission() {
  try {
    console.log('🧪 Testing Report Submission Fix...\n');

    // Step 1: Login as citizen
    console.log('1. 👤 Logging in as citizen...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed, creating test user...');
      
      // Create test user
      await axios.post('http://localhost:5000/api/auth/register', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'test123',
        userType: 'citizen',
        ward: 'Ward 1 - Downtown'
      });
      
      // Login again
      const retryLogin = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      
      if (!retryLogin.data.success) {
        throw new Error('Failed to login after registration');
      }
      
      console.log('✅ Test user created and logged in');
    } else {
      console.log('✅ Citizen logged in successfully');
    }

    const token = loginResponse.data.token || loginResponse.data.data?.token;
    
    // Step 2: Submit a test report
    console.log('\n2. 📋 Submitting test report...');
    const reportData = {
      locationAddress: 'Test Street, Test City, Karnataka',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      city: 'Bangalore',
      damageType: 'Pothole',
      severity: 'medium',
      description: 'Test pothole report for fixing submission issue',
      aiAnalysis: {
        confidence: 85,
        damageType: 'Pothole',
        severity: 'Medium',
        estimatedCost: '₹5000',
        estimatedRepairTime: '2-3 Days'
      },
      priority: 'Medium'
    };

    const reportResponse = await axios.post('http://localhost:5000/api/reports', reportData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (reportResponse.data.success) {
      console.log('✅ Report submitted successfully!');
      console.log(`   Complaint ID: ${reportResponse.data.data.complaintId}`);
      console.log(`   Status: ${reportResponse.data.data.report.status}`);
      
      // Step 3: Test fetching reports
      console.log('\n3. 📊 Testing report retrieval...');
      const fetchResponse = await axios.get('http://localhost:5000/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (fetchResponse.data.success) {
        console.log(`✅ Reports fetched successfully! Found ${fetchResponse.data.data.reports.length} reports`);
        
        // Step 4: Test tracking
        const complaintId = reportResponse.data.data.complaintId;
        console.log('\n4. 🔍 Testing report tracking...');
        const trackResponse = await axios.get(`http://localhost:5000/api/reports/track/${complaintId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (trackResponse.data.success) {
          console.log('✅ Report tracking working!');
          console.log(`   Status: ${trackResponse.data.data.report.status}`);
        } else {
          console.log('❌ Report tracking failed:', trackResponse.data.message);
        }
      } else {
        console.log('❌ Report fetching failed:', fetchResponse.data.message);
      }
    } else {
      console.log('❌ Report submission failed:', reportResponse.data.message);
    }

    console.log('\n🎉 Report submission fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testReportSubmission();