const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStatusEnum() {
  console.log('🔧 Fixing Status ENUM...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'road_damage_db'
    });

    console.log('✅ Connected to database');

    // Update the ENUM to include all workflow statuses
    const alterQuery = `
      ALTER TABLE reports 
      MODIFY COLUMN status ENUM(
        'Submitted',
        'Under Review', 
        'Approved',
        'Assigned',
        'In Progress',
        'Delayed',
        'Completed',
        'Rejected',
        'Closed'
      ) DEFAULT 'Submitted'
    `;

    console.log('🔄 Updating status ENUM to include all workflow statuses...');
    await connection.execute(alterQuery);
    console.log('✅ Status ENUM updated successfully');

    // Test the new ENUM values
    console.log('\n🧪 Testing new ENUM values...');
    
    const testStatuses = ['Assigned', 'Delayed', 'Closed'];
    
    for (const status of testStatuses) {
      try {
        const [result] = await connection.execute(
          'UPDATE reports SET status = ? WHERE complaintId = "RD-2025-007805"',
          [status]
        );
        
        const [check] = await connection.execute(
          'SELECT status FROM reports WHERE complaintId = "RD-2025-007805"'
        );
        
        console.log(`✅ ${status}: ${check[0].status === status ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        console.log(`❌ ${status}: FAILED - ${error.message}`);
      }
    }

    // Reset to Approved for testing
    await connection.execute(
      'UPDATE reports SET status = ? WHERE complaintId = "RD-2025-007805"',
      ['Approved']
    );
    console.log('\n🔄 Reset test report to Approved status');

    // Verify the schema change
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM reports WHERE Field = 'status'"
    );
    
    console.log('\n📋 Updated status column:');
    console.log(`- Type: ${columns[0].Type}`);
    console.log(`- Default: ${columns[0].Default}`);

    await connection.end();
    console.log('\n✅ Status ENUM fix completed');

  } catch (error) {
    console.error('❌ Error fixing status ENUM:', error);
  }
}

fixStatusEnum();