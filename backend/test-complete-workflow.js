const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCompleteWorkflow() {
  console.log('🔍 Testing Complete Workflow...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'road_damage_db'
    });

    console.log('✅ Connected to database');

    // Reset test report to Submitted status
    await connection.execute(
      'UPDATE reports SET status = ?, statusHistory = ? WHERE complaintId = ?',
      ['Submitted', JSON.stringify([{
        status: 'Submitted',
        updatedAt: new Date(),
        updatedBy: 57,
        notes: 'Report submitted by user'
      }]), 'RD-2025-007805']
    );

    console.log('🔄 Reset test report to Submitted status');

    // Define the complete workflow
    const workflowActions = [
      { action: 'approve', expectedStatus: 'Approved', step: 0 },
      { action: 'assign', expectedStatus: 'Assigned', step: 1 },
      { action: 'start-work', expectedStatus: 'In Progress', step: 2 },
      { action: 'resolved', expectedStatus: 'Completed', step: 3 },
      { action: 'closed', expectedStatus: 'Closed', step: 4 }
    ];

    const actionStatusMap = {
      'approve': 'Approved',
      'reject': 'Rejected', 
      'assign': 'Assigned',
      'start-work': 'In Progress',
      'delay': 'Delayed',
      'resolved': 'Completed',
      'closed': 'Closed'
    };

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

    console.log('\n🔄 Testing complete workflow sequence...\n');

    for (let i = 0; i < workflowActions.length; i++) {
      const { action, expectedStatus, step } = workflowActions[i];
      
      console.log(`--- Step ${i + 1}: ${action.toUpperCase()} ---`);
      
      // Get current status
      const [currentReport] = await connection.execute(
        'SELECT status FROM reports WHERE complaintId = ?',
        ['RD-2025-007805']
      );
      
      const currentStatus = currentReport[0].status;
      const currentStep = statusMap[currentStatus] ?? -1;
      
      console.log(`📊 Current status: ${currentStatus} (step ${currentStep})`);
      console.log(`🎯 Executing action: ${action} → Expected: ${expectedStatus}`);
      
      // Check if this action should be enabled
      const shouldBeEnabled = (currentStep + 1) === step;
      console.log(`✅ Action should be enabled: ${shouldBeEnabled}`);
      
      if (!shouldBeEnabled) {
        console.log(`❌ WORKFLOW ERROR: Action ${action} should not be enabled at step ${currentStep}`);
        break;
      }
      
      // Execute the action (simulate API call)
      const newStatus = actionStatusMap[action];
      
      // Get existing status history
      const [reportData] = await connection.execute(
        'SELECT statusHistory FROM reports WHERE complaintId = ?',
        ['RD-2025-007805']
      );
      
      let statusHistory = [];
      if (reportData[0].statusHistory) {
        try {
          statusHistory = JSON.parse(reportData[0].statusHistory);
        } catch (e) {
          statusHistory = [];
        }
      }
      
      // Add new status to history
      statusHistory.push({
        status: newStatus,
        updatedBy: 56,
        updatedAt: new Date(),
        notes: `Status updated to ${newStatus} by municipal officer`,
        action: action
      });
      
      // Update the report
      await connection.execute(
        'UPDATE reports SET status = ?, statusHistory = ? WHERE complaintId = ?',
        [newStatus, JSON.stringify(statusHistory), 'RD-2025-007805']
      );
      
      // Verify the update
      const [updatedReport] = await connection.execute(
        'SELECT status FROM reports WHERE complaintId = ?',
        ['RD-2025-007805']
      );
      
      const actualStatus = updatedReport[0].status;
      const actualStep = statusMap[actualStatus] ?? -1;
      
      console.log(`📊 Updated status: ${actualStatus} (step ${actualStep})`);
      
      if (actualStatus === expectedStatus && actualStep === step) {
        console.log(`✅ SUCCESS: Status correctly updated to ${expectedStatus}`);
        
        // Check next available action
        if (step < workflowActions.length - 1) {
          const nextAction = workflowActions[step + 1];
          console.log(`🔜 Next available action: ${nextAction.action}`);
        } else {
          console.log(`🏁 Workflow complete!`);
        }
      } else {
        console.log(`❌ FAILED: Expected ${expectedStatus} (step ${step}), got ${actualStatus} (step ${actualStep})`);
        break;
      }
      
      console.log('');
    }

    await connection.end();
    console.log('✅ Complete workflow test finished');

  } catch (error) {
    console.error('❌ Error testing complete workflow:', error);
  }
}

testCompleteWorkflow();