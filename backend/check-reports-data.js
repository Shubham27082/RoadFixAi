const { sequelize } = require('./config/database');
const Report = require('./models/Report');
const User = require('./models/User');

async function checkReportsData() {
  try {
    console.log('🔍 Checking Reports Data...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Set up associations
    const models = { User, Report };
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    // Check all reports
    const allReports = await Report.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward', 'userType']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n📊 Total Reports in Database: ${allReports.length}\n`);

    if (allReports.length === 0) {
      console.log('⚠️  No reports found in database. Creating sample reports...');
      
      // Get a citizen user to create reports
      const citizenUser = await User.findOne({ where: { userType: 'citizen' } });
      if (citizenUser) {
        // Create sample reports
        const sampleReports = [
          {
            complaintId: `RD-2024-${Date.now().toString().slice(-6)}`,
            userId: citizenUser.id,
            locationAddress: 'MG Road, Bengaluru Urban, Karnataka',
            state: 'Karnataka',
            district: 'Bengaluru Urban',
            city: 'Bengaluru',
            damageType: 'Pothole',
            severity: 'high',
            description: 'Large pothole causing traffic issues',
            priority: 'High',
            status: 'Submitted',
            aiAnalysis: {
              confidence: 92,
              damageType: 'Pothole',
              severity: 'High',
              estimatedCost: '₹15000',
              estimatedRepairTime: '1-2 Days'
            },
            statusHistory: [{
              status: 'Submitted',
              updatedAt: new Date(),
              updatedBy: citizenUser.id,
              notes: 'Report submitted by user'
            }]
          },
          {
            complaintId: `RD-2024-${(Date.now() + 1000).toString().slice(-6)}`,
            userId: citizenUser.id,
            locationAddress: 'Brigade Road, Bengaluru Urban, Karnataka',
            state: 'Karnataka',
            district: 'Bengaluru Urban',
            city: 'Bengaluru',
            damageType: 'Crack',
            severity: 'medium',
            description: 'Road surface cracking near bus stop',
            priority: 'Medium',
            status: 'Under Review',
            aiAnalysis: {
              confidence: 87,
              damageType: 'Crack',
              severity: 'Medium',
              estimatedCost: '₹8000',
              estimatedRepairTime: '3-5 Days'
            },
            statusHistory: [{
              status: 'Submitted',
              updatedAt: new Date(),
              updatedBy: citizenUser.id,
              notes: 'Report submitted by user'
            }]
          }
        ];

        for (const reportData of sampleReports) {
          await Report.create(reportData);
        }
        
        console.log('✅ Sample reports created successfully');
        
        // Fetch reports again
        const newReports = await Report.findAll({
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'ward', 'userType']
          }],
          order: [['createdAt', 'DESC']]
        });
        
        console.log(`\n📊 Reports after creation: ${newReports.length}\n`);
        
        newReports.forEach((report, index) => {
          console.log(`Report ${index + 1}:`);
          console.log(`  - ID: ${report.id}`);
          console.log(`  - Complaint ID: ${report.complaintId}`);
          console.log(`  - Status: ${report.status}`);
          console.log(`  - Priority: ${report.priority}`);
          console.log(`  - Damage Type: ${report.damageType}`);
          console.log(`  - Location: ${report.locationAddress}`);
          console.log(`  - Submitted by: ${report.user?.firstName} ${report.user?.lastName} (${report.user?.ward})`);
          console.log(`  - Assigned to: ${report.assignedToId || 'Not assigned'}`);
          console.log('---');
        });
      } else {
        console.log('❌ No citizen users found to create sample reports');
      }
    } else {
      allReports.forEach((report, index) => {
        console.log(`Report ${index + 1}:`);
        console.log(`  - ID: ${report.id}`);
        console.log(`  - Complaint ID: ${report.complaintId}`);
        console.log(`  - Status: ${report.status}`);
        console.log(`  - Priority: ${report.priority}`);
        console.log(`  - Damage Type: ${report.damageType}`);
        console.log(`  - Location: ${report.locationAddress}`);
        console.log(`  - Submitted by: ${report.user?.firstName} ${report.user?.lastName} (${report.user?.ward})`);
        console.log(`  - Assigned to: ${report.assignedToId || 'Not assigned'}`);
        console.log('---');
      });
    }

    // Check municipal users
    console.log('\n👥 Municipal Users:');
    const municipalUsers = await User.findAll({
      where: { userType: 'municipal' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'ward', 'isActive', 'isEmailVerified']
    });

    municipalUsers.forEach((user, index) => {
      console.log(`Municipal User ${index + 1}:`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Name: ${user.firstName} ${user.lastName}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Ward: ${user.ward}`);
      console.log(`  - Active: ${user.isActive}`);
      console.log(`  - Email Verified: ${user.isEmailVerified}`);
      console.log('---');
    });

    console.log('\n🎉 Reports data check completed!');

  } catch (error) {
    console.error('❌ Error checking reports data:', error);
  } finally {
    await sequelize.close();
  }
}

checkReportsData();