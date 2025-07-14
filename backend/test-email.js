require('dotenv').config();
const { sendEmail } = require('./utils/email');

async function testEmail() {
  try {
    console.log('Testing email functionality...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Key:', process.env.EMAIL_KEY ? 'Set' : 'Not Set');
    
    const result = await sendEmail(
      'test@example.com', // Replace with your email for testing
      'RunMap Email Test',
      'This is a test email from RunMap backend to verify email functionality is working correctly.'
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result);
    } else {
      console.log('❌ Email failed to send');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail(); 