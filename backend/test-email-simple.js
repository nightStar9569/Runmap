const { sendEmail } = require('./utils/email');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Simple Email Test');
  console.log('===================\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n❌ Email configuration incomplete!');
    console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return;
  }
  
  try {
    console.log('\n📧 Sending test email...');
    
    const testEmail = process.env.EMAIL_USER;
    const subject = '🧪 RunMap Email Test';
    const message = `
Hello!

This is a test email from the RunMap email reminder system.

If you receive this email, your email configuration is working correctly!

Test Details:
- Time: ${new Date().toISOString()}
- System: RunMap Email Reminder Test
- Status: ✅ Working

Best regards,
RunMap Team
    `.trim();
    
    const result = await sendEmail(testEmail, subject, message);
    
    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox for the test email');
      console.log('📧 Sent to:', testEmail);
      console.log('🆔 Message ID:', result);
    } else {
      console.log('❌ Email sending failed - no message ID returned');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your EMAIL_USER and EMAIL_PASS in .env file');
    console.log('2. For Gmail: Make sure you\'re using an App Password, not your regular password');
    console.log('3. Enable 2-Factor Authentication on your Gmail account');
    console.log('4. Generate an App Password in Google Account settings');
    console.log('5. Check if your email provider allows SMTP access');
    console.log('6. Try using a different email provider (Outlook, Yahoo, etc.)');
  }
}

testEmail(); 