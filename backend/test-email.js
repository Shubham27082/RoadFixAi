const emailService = require('./services/emailService');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured');
    console.log('💡 Please update your .env file with email settings');
    console.log('📖 See email-setup-guide.md for detailed instructions');
    return;
  }

  console.log('📧 Email Configuration:');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM}\n`);

  try {
    // Test SMTP connection
    console.log('🔌 Testing SMTP connection...');
    const connectionTest = await emailService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ SMTP connection successful!\n');
      
      // Ask for test email address
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('📮 Enter your email address to receive a test verification code: ', async (testEmail) => {
        if (!testEmail || !testEmail.includes('@')) {
          console.log('❌ Invalid email address');
          rl.close();
          return;
        }

        try {
          console.log(`\n📤 Sending test verification email to ${testEmail}...`);
          
          const result = await emailService.sendVerificationEmail(
            testEmail,
            'Test User',
            '123456'
          );
          
          if (result.success) {
            console.log('✅ Test email sent successfully!');
            console.log('📬 Check your inbox for the verification email');
            console.log('🎉 Email configuration is working correctly!');
          } else {
            console.log('❌ Failed to send test email:', result.error);
          }
        } catch (error) {
          console.log('❌ Email sending failed:', error.message);
        }
        
        rl.close();
      });

    } else {
      console.log('❌ SMTP connection failed:', connectionTest.error);
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Check your email credentials in .env file');
      console.log('   2. Make sure you\'re using an App Password for Gmail');
      console.log('   3. Verify 2-Factor Authentication is enabled');
      console.log('   4. Check your internet connection');
      console.log('📖 See email-setup-guide.md for detailed help');
    }
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    console.log('📖 See email-setup-guide.md for setup instructions');
  }
}

testEmailConfiguration();