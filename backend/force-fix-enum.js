const mysql = require('mysql2/promise');
require('dotenv').config();

async function forceFixEnum() {
  console.log('🔧 Force Fixing Status ENUM...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'road_damage_db'
    });

    console.log('✅ Connected to database');

    // First, let's see what the current ENUM looks like
    const [currentSchema] = await connection.execute(
      "SHOW COLUMNS FROM reports WHERE Field = 'status'"
    );
    
    console.log('📋 Current status ENUM:');
    console.log(`- Type: ${currentSchema[0].Type}`);

    // Try a more explicit ALTER TABLE command
    console.log('\n🔄 Attempting to modify ENUM...');
    
    try {
      await connection.execute(`
        ALTER TABLE reports 
        MODIFY status ENUM(
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
      `);
      console.log('✅ ENUM modification successful');
    } catch (alterError) {
      console.log('❌ ALTER TABLE failed:', alterError.message);
      
      // Try dropping and recreating the column
      console.log('🔄 Trying alternative approach...');
      
      // Add a temporary column
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN status_new ENUM(
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
      `);
      
      // Copy data from old column to new column
      await connection.execute(`
        UPDATE reports 
        SET status_new = CASE 
          WHEN status = '' OR status IS NULL THEN 'Submitted'
          ELSE status 
        END
      `);
      
      // Drop old column
      await connection.execute('ALTER TABLE reports DROP COLUMN status');
      
      // Rename new column
      await connection.execute(`ALTER TABLE reports CHANGE status_new status ENUM(
        'Submitted',
        'Under Review', 
        'Approved',
        'Assigned',
        'In Progress',
        'Delayed', 
        'Completed',
        'Rejected',
        'Closed'
      ) DEFAULT 'Submitted'`);
      
      console.log('✅ Column recreated successfully');
    }

    // Verify the change
    const [newSchema] = await connection.execute(
      "SHOW COLUMNS FROM reports WHERE Field = 'status'"
    );
    
    console.log('\n📋 Updated status ENUM:');
    console.log(`- Type: ${newSchema[0].Type}`);

    // Test all the new values
    console.log('\n🧪 Testing all ENUM values...');
    
    const testValues = ['Submitted', 'Under Review', 'Approved', 'Assigned', 'In Progress', 'Delayed', 'Completed', 'Rejected', 'Closed'];
    
    for (const value of testValues) {
      try {
        await connection.execute(
          'UPDATE reports SET status = ? WHERE complaintId = "RD-2025-007805"',
          [value]
        );
        
        const [check] = await connection.execute(
          'SELECT status FROM reports WHERE complaintId = "RD-2025-007805"'
        );
        
        const success = check[0].status === value;
        console.log(`${success ? '✅' : '❌'} ${value}: ${success ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        console.log(`❌ ${value}: ERROR - ${error.message}`);
      }
    }

    // Reset to Submitted for testing
    await connection.execute(
      'UPDATE reports SET status = "Submitted" WHERE complaintId = "RD-2025-007805"'
    );
    console.log('\n🔄 Reset test report to Submitted');

    await connection.end();
    console.log('\n✅ Force ENUM fix completed');

  } catch (error) {
    console.error('❌ Error force fixing ENUM:', error);
  }
}

forceFixEnum();