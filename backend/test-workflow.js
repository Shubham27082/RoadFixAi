const mysql = require('mysql2/promise');
require('dotenv').config();

async function testWorkflow() {
  console.log('🔍 Testing Municipal Workflow...');
  
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'road_damage_db'
    });

    console.log('✅ Connected to database');

    // Get a sample report
    const [reports] = await connection.execute(
      'SELECT id, complaintId, status, statusHistory FROM reports LIMIT 1'
    );

    if (reports.length === 0) {
      console.log('❌ No reports found in database');
      return;
    }

    const report = reports[0];
    console.log(`📋 Testing with report: ${report.complaintId}`);
    console.log(`📊 Current status: ${report.status}`);
    console.log(`📜 Status history:`, report.statusHistory);

    // Test workflow sequence
    const workflowSequence = [
      { action: 'approve', expectedStatus: 'Approved' },
      { action: 'assign', expectedStatus: 'Assigned' },
      { action: 'start-work', expectedStatus: 'In Progress' },
      { action: 'resolved', expectedStatus: 'Completed' },
      { action: 'closed', expectedStatus: 'Closed' }
    ];

    console.log('\n🔄 Workflow Sequence:');
    workflowSequence.forEach((step, index) => {
      console.log(`${index + 1}. ${step.action} → ${step.expectedStatus}`);
    });

    // Check current step based on status
    const statusMap = {
      'Submitted': -1,
      'Under Review': -1,
      'Approved': 0,
      'Assigned': 1,
      'In Progress': 2,
      'Delayed': 2,
      'Completed': 3,
      'Closed': 4,
      'Rejected': -2
    };

    const currentStep = statusMap[report.status] ?? -1;
    console.log(`\n📍 Current step index: ${currentStep}`);
    
    if (currentStep >= 0) {
      console.log(`✅ Next available action: ${workflowSequence[currentStep + 1]?.action || 'None (workflow complete)'}`);
    } else {
      console.log(`✅ Next available action: ${workflowSequence[0].action} (start workflow)`);
    }

    await connection.end();
    console.log('\n✅ Workflow test completed');

  } catch (error) {
    console.error('❌ Error testing workflow:', error);
  }
}

testWorkflow();