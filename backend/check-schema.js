const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  console.log('🔍 Checking Database Schema...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'road_damage_db'
    });

    console.log('✅ Connected to database');

    // Check reports table schema
    const [columns] = await connection.execute('DESCRIBE reports');
    console.log('\n📋 Reports table schema:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });

    // Check current report data
    const [reports] = await connection.execute(
      'SELECT id, complaintId, status, LENGTH(status) as status_length FROM reports WHERE complaintId = "RD-2025-007805"'
    );

    if (reports.length > 0) {
      const report = reports[0];
      console.log(`\n📊 Current report data:`);
      console.log(`- ID: ${report.id}`);
      console.log(`- Complaint ID: ${report.complaintId}`);
      console.log(`- Status: "${report.status}"`);
      console.log(`- Status length: ${report.status_length}`);
    }

    // Test direct status update
    console.log('\n🧪 Testing direct status update...');
    const [updateResult] = await connection.execute(
      'UPDATE reports SET status = ? WHERE complaintId = ?',
      ['Assigned', 'RD-2025-007805']
    );
    
    console.log(`✅ Direct update result: ${updateResult.affectedRows} row(s) affected`);

    // Check the result
    const [updatedReports] = await connection.execute(
      'SELECT id, complaintId, status, LENGTH(status) as status_length FROM reports WHERE complaintId = "RD-2025-007805"'
    );

    if (updatedReports.length > 0) {
      const report = updatedReports[0];
      console.log(`\n📊 After direct update:`);
      console.log(`- Status: "${report.status}"`);
      console.log(`- Status length: ${report.status_length}`);
    }

    await connection.end();
    console.log('\n✅ Schema check completed');

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkSchema();