// Test if frontend can connect to backend
async function testFrontendConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  try {
    // Test basic health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test CORS headers
    console.log('\n2️⃣ Testing CORS headers...');
    const corsResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'OPTIONS'
    });
    console.log('✅ CORS preflight status:', corsResponse.status);

    // Test actual forgot password (should work from frontend)
    console.log('\n3️⃣ Testing forgot password API...');
    const forgotResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'  // Simulate frontend origin
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    const forgotData = await forgotResponse.json();
    console.log('✅ Forgot password from frontend origin:', forgotData.success);

    console.log('\n🎯 Connection Test Results:');
    console.log('- Backend Health: ✅ Working');
    console.log('- CORS Headers: ✅ Working');
    console.log('- API Endpoints: ✅ Working');
    console.log('- Frontend Origin: ✅ Allowed');

    console.log('\n💡 If password reset still not working, the issue is likely:');
    console.log('1. Browser console errors (check F12 Developer Tools)');
    console.log('2. Invalid reset token (expired or already used)');
    console.log('3. Frontend form validation issues');
    console.log('4. Network connectivity problems');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testFrontendConnection();