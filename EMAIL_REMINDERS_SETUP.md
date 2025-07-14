# Email Reminder System Setup Guide

## Overview
The RunMap application now includes an automated email reminder system that sends notifications to users who have applied for events. The system sends reminders:
- **7 days before** the event starts
- **1 day before** the event starts

## Features
- ✅ Automated daily email reminders
- ✅ Only sends to users with approved applications
- ✅ Only sends to users with notifications enabled
- ✅ Creates in-app notifications
- ✅ Japanese language support
- ✅ Detailed event information in emails

## Database Setup

### 1. Run the Migration
First, run the new migration to create the EventApplications table:

```bash
cd Runmap/backend
npx sequelize-cli db:migrate
```

### 2. Verify the Table
The migration creates:
- `EventApplications` table with fields:
  - `id` (Primary Key)
  - `userId` (Foreign Key to Users)
  - `eventId` (Foreign Key to Events)
  - `status` (ENUM: 'pending', 'approved', 'rejected')
  - `appliedAt` (Timestamp)
  - `createdAt`, `updatedAt` (Timestamps)

## Email Configuration

### 1. Environment Variables
Add these to your `.env` file:

```env
# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# For Gmail, use App Password, not your regular password
# Enable 2FA and generate an App Password in Google Account settings
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### 3. Alternative Email Providers
You can modify `backend/utils/email.js` to use other providers:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Testing the System

### 1. Manual Test
Run the test script to manually trigger email reminders:

```bash
cd Runmap/backend
node test-email-reminders.js
```

### 2. Create Test Data
To test the system, you need:
1. Events with dates exactly 1 or 7 days from now
2. Users with approved applications for those events
3. Users with `notificationEnabled: true`

Example SQL to create test data:

```sql
-- Create a test event for tomorrow
INSERT INTO Events (name, description, date, location, applyDeadline, createdAt, updatedAt)
VALUES ('Test Marathon', 'Test event for tomorrow', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Tokyo', CURDATE(), NOW(), NOW());

-- Create a test event for 7 days from now
INSERT INTO Events (name, description, date, location, applyDeadline, createdAt, updatedAt)
VALUES ('Test Marathon 7 Days', 'Test event for 7 days', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Osaka', CURDATE(), NOW(), NOW());

-- Create test applications (replace user_id and event_id with actual IDs)
INSERT INTO EventApplications (userId, eventId, status, appliedAt, createdAt, updatedAt)
VALUES (1, 1, 'approved', NOW(), NOW(), NOW());
```

### 3. Test Email Sending
Test the email functionality directly:

```javascript
// In Node.js console or test file
const { sendEmail } = require('./utils/email');

sendEmail('test@example.com', 'Test Subject', 'Test message')
  .then(() => console.log('Email sent successfully'))
  .catch(err => console.error('Email failed:', err));
```

## Cron Job Schedule

The email reminder system runs automatically:
- **Schedule**: Every day at 9:00 AM
- **File**: `backend/cron/eventReminders.js`
- **Function**: Sends reminders for events happening in 1 or 7 days

### Customizing the Schedule
You can modify the cron schedule in `backend/cron/eventReminders.js`:

```javascript
// Run every hour
cron.schedule('0 * * * *', async () => { ... });

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => { ... });

// Run at specific times
cron.schedule('0 9,18 * * *', async () => { ... }); // 9 AM and 6 PM
```

## API Endpoints

### Event Applications
- `POST /events/apply` - Apply for an event
- `GET /events/user/applications` - Get user's applications
- `DELETE /events/applications/:eventId` - Cancel application

### Admin Endpoints
- `GET /events/:eventId/applications` - Get all applications for an event
- `PUT /events/applications/:applicationId/status` - Update application status

## Frontend Integration

The frontend automatically:
- Shows "申し込み済み" (Applied) status for events
- Fetches user's applied events on page load
- Handles application submission with proper error messages

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check `EMAIL_USER` and `EMAIL_PASS` environment variables
   - Verify Gmail App Password is correct
   - Check if 2FA is enabled on Gmail account

2. **Cron job not running**
   - Ensure the cron file is imported in `app.js`
   - Check server logs for cron job messages
   - Verify the cron schedule syntax

3. **No reminders being sent**
   - Check if events exist with correct dates
   - Verify applications have 'approved' status
   - Ensure users have `notificationEnabled: true`

### Debug Mode
Enable debug logging by adding to `backend/cron/eventReminders.js`:

```javascript
console.log('Debug: Current time:', new Date().toISOString());
console.log('Debug: Looking for events on:', oneDayAheadStr, sevenDaysAheadStr);
console.log('Debug: Found events:', events.map(e => ({ id: e.id, name: e.name, date: e.date })));
```

## Production Deployment

### 1. Environment Variables
Ensure all email environment variables are set in production.

### 2. Database Migration
Run migrations in production:
```bash
NODE_ENV=production npx sequelize-cli db:migrate
```

### 3. Cron Job Monitoring
Monitor the cron job in production:
- Check server logs for cron job execution
- Set up alerts for cron job failures
- Monitor email delivery rates

### 4. Email Service Limits
- Gmail: 500 emails/day for regular accounts, 2000/day for Google Workspace
- Consider using dedicated email services (SendGrid, Mailgun) for high volume

## Security Considerations

1. **Email Credentials**: Never commit email passwords to version control
2. **Rate Limiting**: Consider implementing rate limiting for email sending
3. **Unsubscribe**: Consider adding unsubscribe functionality
4. **Data Privacy**: Ensure compliance with email privacy laws

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test email configuration manually
4. Verify database data integrity 