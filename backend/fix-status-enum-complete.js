const { sequelize } = require('./config/database');

async function fixStatusEnum() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Update the ENUM to include all workflow statuses
    const query = `
      ALTER TABLE reports 
      MODIFY COLUMN status ENUM(
        'Submitted', 
        'Under Review', 
        'Approved', 
        'Assigned', 
        'In Progress', 
        'Delayed', 
        'Completed', 
        'Closed', 
        'Rejected'
      ) DEFAULT 'Submitted'
    `;

    await sequelize.query(query);
    console.log('✅ Status ENUM updated successfully');

    // Fix any reports with empty status
    const updateEmptyStatus = `
      UPDATE reports 
      SET status = 'Submitted' 
      WHERE status = '' OR status IS NULL
    `;

    const [results] = await sequelize.query(updateEmptyStatus);
    console.log(`✅ Fixed ${results.affectedRows || 0} reports with empty status`);

    console.log('\n🎉 Status ENUM fix completed!');
    console.log('Available statuses:');
    console.log('- Submitted');
    console.log('- Under Review');
    console.log('- Approved');
    console.log('- Assigned');
    console.log('- In Progress');
    console.log('- Delayed');
    console.log('- Completed');
    console.log('- Closed');
    console.log('- Rejected');
    
  } catch (error) {
    console.error('❌ Error fixing status ENUM:', error);
  } finally {
    process.exit(0);
  }
}

fixStatusEnum();