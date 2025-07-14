# Email Reminder Testing Guide

## 🎯 Overview
This guide will help you test the email reminder functionality to ensure it's working correctly. The system sends reminders 7 days and 1 day before events to users who have applied and been approved.

## 📋 Prerequisites

### 1. Environment Setup
Make sure you have the following in your `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## 🧪 Testing Steps

### Step 1: Test Email Configuration
First, verify that your email setup is working:

```bash
cd Runmap/backend
node test-email-config.js
```

**Expected Output:**
```
🧪 Testing email configuration...

📋 Environment Variables:
EMAIL_USER: ✅ Set
EMAIL_PASS: ✅ Set

📧 Sending test email...
✅ Test email sent successfully!
📬 Check your inbox for the test email
📧 Sent to: your-email@gmail.com
```

**If it fails:**
- Check your `.env` file
- Verify Gmail App Password is correct
- Ensure 2FA is enabled on Gmail

### Step 2: Set Up Test Data
Create test data for email reminder testing:

```bash
cd Runmap/backend
node test-email-setup.js
```

**Expected Output:**
```
Setting up test data for email reminder testing...
✅ Test user created: testuser
✅ Test events created:
  - Event 1: Test Marathon Tomorrow Date: 2025-01-11
  - Event 2: Test Marathon 7 Days Date: 2025-01-17
✅ Test applications created:
  - Application 1: User testuser -> Event Test Marathon Tomorrow
  - Application 2: User testuser -> Event Test Marathon 7 Days

🎯 Test data setup complete!
```

### Step 3: Test Email Reminders
Run the email reminder test:

```bash
cd Runmap/backend
node test-email-reminders.js
```

**Expected Output:**
```
Testing email reminder functionality...
Looking for events on: 2025-01-11 and 2025-01-17
Found 2 events for reminders
Event: Test Marathon Tomorrow, Days until: 1
Found 1 applications for event: Test Marathon Tomorrow
✅ Sent reminder to test@example.com for event: Test Marathon Tomorrow
Event: Test Marathon 7 Days, Days until: 7
Found 1 applications for event: Test Marathon 7 Days
✅ Sent reminder to test@example.com for event: Test Marathon 7 Days
Email reminder test completed
```

### Step 4: Check Your Email
Check your email inbox for:
1. **1-day reminder**: "Test Marathon Tomorrow - 明日開催"
2. **7-day reminder**: "Test Marathon 7 Days - 1週間前"

## 🔍 Manual Testing Scenarios

### Scenario 1: Test with Real Dates
1. **Create an event for tomorrow:**
   ```sql
   INSERT INTO Events (name, description, date, location, applyDeadline, createdAt, updatedAt)
   VALUES ('Real Test Event', 'Testing with real date', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Tokyo', CURDATE(), NOW(), NOW());
   ```

2. **Create an application:**
   ```sql
   INSERT INTO EventApplications (userId, eventId, status, appliedAt, createdAt, updatedAt)
   VALUES (1, LAST_INSERT_ID(), 'approved', NOW(), NOW(), NOW());
   ```

3. **Run the reminder test:**
   ```bash
   node test-email-reminders.js
   ```

### Scenario 2: Test Different User States
Test with users who have different settings:

1. **User with notifications disabled:**
   ```sql
   UPDATE Users SET notificationEnabled = false WHERE id = 1;
   ```

2. **User with free membership:**
   ```sql
   UPDATE Users SET membershipStatus = 'free' WHERE id = 1;
   ```

3. **User with pending application:**
   ```sql
   UPDATE EventApplications SET status = 'pending' WHERE userId = 1;
   ```

### Scenario 3: Test Edge Cases
1. **Event with no applications**
2. **Event with only pending applications**
3. **Event with multiple users**
4. **Event that's not exactly 1 or 7 days away**

## 🐛 Troubleshooting

### Common Issues

#### 1. "Email configuration incomplete"
**Solution:** Check your `.env` file and ensure `EMAIL_USER` and `EMAIL_PASS` are set.

#### 2. "Authentication failed"
**Solution:** 
- For Gmail: Use App Password, not regular password
- Enable 2-Factor Authentication
- Generate new App Password

#### 3. "No reminders being sent"
**Possible causes:**
- No events on target dates
- No approved applications
- Users don't have notifications enabled
- Users don't have paid membership

**Debug steps:**
```bash
# Check events
node -e "
const { Event } = require('./models');
const { Op } = require('sequelize');
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
console.log('Tomorrow:', tomorrow.toISOString().slice(0, 10));
console.log('7 days:', sevenDays.toISOString().slice(0, 10));
Event.findAll({
  where: {
    date: {
      [Op.or]: [tomorrow.toISOString().slice(0, 10), sevenDays.toISOString().slice(0, 10)]
    }
  }
}).then(events => {
  console.log('Events found:', events.length);
  events.forEach(e => console.log('-', e.name, e.date));
});
"
```

#### 4. "Database connection error"
**Solution:** Check your database configuration in `config/config.json`

### Debug Mode
Enable detailed logging by modifying `test-email-reminders.js`:

```javascript
// Add these lines at the beginning of the function
console.log('Debug: Current time:', new Date().toISOString());
console.log('Debug: Looking for events on:', oneDayAheadStr, sevenDaysAheadStr);
console.log('Debug: Found events:', events.map(e => ({ id: e.id, name: e.name, date: e.date })));
```

## 📊 Test Results Checklist

- [ ] Email configuration test passes
- [ ] Test data setup completes successfully
- [ ] Email reminder test runs without errors
- [ ] 1-day reminder email received
- [ ] 7-day reminder email received
- [ ] Email content is correct (Japanese text, event details)
- [ ] In-app notifications are created
- [ ] Different user states work correctly
- [ ] Edge cases handled properly

## 🚀 Production Testing

Before deploying to production:

1. **Test with real email addresses**
2. **Verify email delivery rates**
3. **Test with production database**
4. **Monitor cron job execution**
5. **Set up email delivery monitoring**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test email configuration manually
4. Verify database data integrity
5. Check cron job execution logs

## 🎉 Success Criteria

The email reminder system is working correctly when:
- ✅ Test emails are delivered successfully
- ✅ Reminders are sent for events exactly 1 and 7 days away
- ✅ Only approved applications receive reminders
- ✅ Only users with notifications enabled receive reminders
- ✅ Email content is properly formatted in Japanese
- ✅ In-app notifications are created alongside emails
- ✅ No duplicate reminders are sent
- ✅ Error handling works correctly 