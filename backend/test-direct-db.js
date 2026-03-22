const Report = require('./models/Report');
const User = require('./models/User');

async function testDirectDB() {
  try {
    console.log('🔍 Testing direct database access...');
    
    // Find a user
    const user = await User.findOne({ where: { email: 'john.doe@example.com' } });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
    
    // Try to create a report directly
    const reportData = {
      complaintId: 'TEST-2025-001',
      userId: user.id,
      locationAddress: 'Test Street, Bangalore',
      damageType: 'Pothole',
      severity: 'high',
      description: 'Direct DB test',
      status: 'Submitted',
      priority: 'Medium'
    };
    
    console.log('📝 Creating report directly...');
    const report = await Report.create(reportData);
    
    console.log('✅ Report created successfully!');
    console.log(`   ID: ${report.id}`);
    console.log(`   Complaint ID: ${report.complaintId}`);
    
    // Clean up
    await report.destroy();
    console.log('🧹 Test report cleaned up');
    
  } catch (error) {
    console.error('❌ Direct DB test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
  }
}

testDirectDB();