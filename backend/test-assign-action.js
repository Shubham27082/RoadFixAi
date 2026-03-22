const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAssignAction() {
  console.log('🔍 Testing Assign Action...');
  
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'road_damage_db'
    });

    console.log('✅ Connected to database');

    // Get a report with Approved status
    const [reports] = await connection.execute(
      'SELECT id, complaintId, status, statusHistory FROM reports WHERE status = "Approved" LIMIT 1'
    );

    if (reports.length === 0) {
      console.log('❌ No approved reports found in database');
      return;
    }

    const report = reports[0];
    console.log(`📋 Testing assign action on report: ${report.complaintId}`);
    console.log(`📊 Current status: ${report.status}`);

    // Simulate the assign action
    const action = 'assign';
    const actionStatusMap = {
      'approve': 'Approved',
      'reject': 'Rejected', 
      'assign': 'Assigned',
      'start-work': 'In Progress',
      'delay': 'Delayed',
      'resolved': 'Completed',
      'closed': 'Closed'
    };

    const newStatus = actionStatusMap[action];
    console.log(`🎯 Action: ${action} → Expected Status: ${newStatus}`);

    // Parse existing status history
    let statusHistory = [];
    if (report.statusHistory) {
      try {
        statusHistory = JSON.parse(report.statusHistory);
      } catch (e) {
        console.log('⚠️ Failed to parse statusHistory, creating new array');
        statusHistory = [];
      }
    }

    // Add new status to history
    statusHistory.push({
      status: newStatus,
      updatedBy: 56, // Municipal user ID
      updatedAt: new Date(),
      notes: `Status updated to ${newStatus} by municipal officer`,
      action: action
    });

    console.log('📝 New status history entry:', statusHistory[statusHistory.length - 1]);

    // Update the report
    const [updateResult] = await connection.execute(
      'UPDATE reports SET status = ?, statusHistory = ? WHERE id = ?',
      [newStatus, JSON.stringify(statusHistory), report.id]
    );

    console.log(`✅ Update result: ${updateResult.affectedRows} row(s) affected`);

    // Verify the update
    const [updatedReports] = await connection.execute(
      'SELECT id, complaintId, status, statusHistory FROM reports WHERE id = ?',
      [report.id]
    );

    const updatedReport = updatedReports[0];
    console.log(`📊 Updated status: ${updatedReport.status}`);
    console.log(`📜 Updated history length: ${JSON.parse(updatedReport.statusHistory).length}`);

    // Test workflow logic
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

    const currentStep = statusMap[updatedReport.status] ?? -1;
    console.log(`📍 Current step index after update: ${currentStep}`);
    
    const workflowSequence = [
      { action: 'approve', expectedStatus: 'Approved' },
      { action: 'assign', expectedStatus: 'Assigned' },
      { action: 'start-work', expectedStatus: 'In Progress' },
      { action: 'resolved', expectedStatus: 'Completed' },
      { action: 'closed', expectedStatus: 'Closed' }
    ];

    if (currentStep >= 0 && currentStep < workflowSequence.length - 1) {
      console.log(`✅ Next available action: ${workflowSequence[currentStep + 1]?.action}`);
    } else if (currentStep === workflowSequence.length - 1) {
      console.log(`✅ Workflow complete!`);
    } else {
      console.log(`✅ Next available action: ${workflowSequence[0].action} (start workflow)`);
    }

    await connection.end();
    console.log('\n✅ Assign action test completed');

  } catch (error) {
    console.error('❌ Error testing assign action:', error);
  }
}

testAssignAction();