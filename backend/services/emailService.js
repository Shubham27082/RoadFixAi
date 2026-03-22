const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email verification code
  async sendVerificationEmail(email, firstName, verificationCode) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your RoadFix AI Account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - RoadFix AI</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .verification-code { background: white; border: 2px solid #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; margin: 10px 0; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛣️ RoadFix AI</h1>
                <p>Welcome to the Smart Road Damage Reporting System</p>
              </div>
              <div class="content">
                <h2>Hello ${firstName}!</h2>
                <p>Thank you for registering with RoadFix AI. To complete your account setup, please verify your email address using the verification code below:</p>
                
                <div class="verification-code">
                  <p><strong>Your Verification Code:</strong></p>
                  <div class="code">${verificationCode}</div>
                  <p><small>This code will expire in 15 minutes</small></p>
                </div>
                
                <p>Enter this code in the verification form to activate your account and start reporting road damage in your community.</p>
                
                <p><strong>What you can do with RoadFix AI:</strong></p>
                <ul>
                  <li>📸 Report road damage with AI-powered analysis</li>
                  <li>📍 GPS-based location tracking</li>
                  <li>📊 Track repair progress in real-time</li>
                  <li>🏛️ Direct communication with municipal authorities</li>
                </ul>
                
                <p>If you didn't create this account, please ignore this email.</p>
                
                <div class="footer">
                  <p>Best regards,<br>The RoadFix AI Team</p>
                  <p><small>This is an automated message. Please do not reply to this email.</small></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email after successful verification
  async sendWelcomeEmail(email, firstName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to RoadFix AI! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to RoadFix AI</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #059669, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .feature-box { background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to RoadFix AI!</h1>
                <p>Your account has been successfully verified</p>
              </div>
              <div class="content">
                <h2>Hello ${firstName}!</h2>
                <p>Congratulations! Your RoadFix AI account is now active and ready to use. You're now part of a community working together to improve road infrastructure through smart technology.</p>
                
                <div class="feature-box">
                  <h3>🚀 Getting Started</h3>
                  <p>Ready to make a difference? Here's how to report your first road damage:</p>
                  <ol>
                    <li>Take a photo of the damaged road</li>
                    <li>Our AI will analyze the damage automatically</li>
                    <li>Add location details (GPS auto-capture available)</li>
                    <li>Submit your report to municipal authorities</li>
                  </ol>
                </div>
                
                <div class="feature-box">
                  <h3>🔧 Key Features</h3>
                  <ul>
                    <li><strong>AI Analysis:</strong> Automatic damage detection and severity assessment</li>
                    <li><strong>Real-time Tracking:</strong> Monitor repair progress from submission to completion</li>
                    <li><strong>Direct Communication:</strong> Connect with ward members and municipal officers</li>
                    <li><strong>Community Impact:</strong> See how your reports contribute to better roads</li>
                  </ul>
                </div>
                
                <p style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/login" class="button">Start Reporting Now</a>
                </p>
                
                <p>Need help? Check out our user guide or contact our support team. We're here to help you make your community's roads safer and better.</p>
                
                <div class="footer">
                  <p>Thank you for joining RoadFix AI!<br>Together, we're building smarter, safer roads.</p>
                  <p><small>RoadFix AI - Smart Road Damage Reporting System</small></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Welcome email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, firstName, resetUrl) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your RoadFix AI Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - RoadFix AI</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .reset-button { background: white; border: 2px solid #dc2626; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
              .warning { background: #fef2f2; border: 1px solid #fecaca; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .expiry { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <p>RoadFix AI Account Security</p>
              </div>
              <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>We received a request to reset your RoadFix AI account password. Click the button below to create a new password:</p>
                
                <div class="reset-button">
                  <p><strong>Reset Your Password</strong></p>
                  <a href="${resetUrl}" class="button">Reset Password Now</a>
                  <p class="expiry"><small>⏰ This link expires in 5 minutes</small></p>
                </div>
                
                <div class="warning">
                  <p><strong>⚠️ Security Notice:</strong></p>
                  <ul>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>This link can only be used once</li>
                    <li>Never share this link with anyone</li>
                    <li>Our team will never ask for your password via email or phone</li>
                  </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
                
                <p>If you didn't request this reset, your account is still secure. You can safely ignore this email.</p>
                
                <div class="footer">
                  <p>Stay secure,<br>The RoadFix AI Security Team</p>
                  <p><small>This is an automated security message. Please do not reply to this email.</small></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Password reset email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send status update email to citizen
  async sendStatusUpdateEmail(email, name, complaintId, subject, message, status, location) {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .status-progress { background: #28a745; color: white; }
            .status-delay { background: #ffc107; color: #212529; }
            .status-completed { background: #28a745; color: white; }
            .status-approved { background: #17a2b8; color: white; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚧 Road Damage Report Update</h1>
              <p>Complaint ID: ${complaintId}</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>${message}</p>
              
              <div class="info-box">
                <h3>📋 Report Details</h3>
                <p><strong>Complaint ID:</strong> ${complaintId}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Current Status:</strong> <span class="status-badge status-progress">${status}</span></p>
                <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>You can track the progress of your complaint anytime by visiting our tracking page.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/track" class="btn">Track Your Complaint</a>
              </div>
              
              <div class="footer">
                <p>Thank you for helping us improve road safety in your community!</p>
                <p><strong>Road Damage Reporting System</strong></p>
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Road Fix AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Status update email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Status update email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return { success: true };
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();