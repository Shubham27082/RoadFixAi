const { sequelize } = require('./config/database');
const Report = require('./models/Report');

async function checkAIAnalysisData() {
  try {
    console.log('Checking AI Analysis data in database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Fetch all reports with AI analysis
    const reports = await Report.findAll({
      attributes: ['id', 'complaintId', 'damageType', 'aiAnalysis'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    console.log(`\n📊 Found ${reports.length} reports:`);
    console.log('='.repeat(80));
    
    reports.forEach((report, index) => {
      console.log(`\nReport ${index + 1}:`);
      console.log(`- ID: ${report.id}`);
      console.log(`- Complaint ID: ${report.complaintId}`);
      console.log(`- Damage Type: ${report.damageType}`);
      console.log(`- AI Analysis Type: ${typeof report.aiAnalysis}`);
      console.log(`- AI Analysis Value: ${JSON.stringify(report.aiAnalysis, null, 2)}`);
      
      if (report.aiAnalysis) {
        try {
          let analysis = report.aiAnalysis;
          
          // If it's a string, try to parse it
          if (typeof analysis === 'string') {
            analysis = JSON.parse(analysis);
          }
          
          console.log('  Parsed AI Analysis:');
          console.log(`  - Confidence: ${analysis.confidence}%`);
          console.log(`  - Est. Cost: ${analysis.estimatedCost}`);
          console.log(`  - Est. Time: ${analysis.estimatedRepairTime}`);
          
          if (analysis.damageArea) {
            console.log(`  - Damage Area: ${analysis.damageArea}`);
          }
          if (analysis.riskLevel) {
            console.log(`  - Risk Level: ${analysis.riskLevel}`);
          }
        } catch (e) {
          console.log(`  ❌ Error parsing AI analysis: ${e.message}`);
        }
      } else {
        console.log('  ❌ No AI Analysis data');
      }
    });
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAIAnalysisData();