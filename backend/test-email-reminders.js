const { Op } = require('sequelize');
const Event = require('./models').Event;
const EventApplication = require('./models').EventApplication;
const User = require('./models').User;
const Notification = require('./models').Notification;
const { sendEmail } = require('./utils/email');
const { sequelize } = require('./models');

async function testEmailReminders() {
  console.log('🧪 Testing Email Reminder Functionality...\n');
  
  try {
    const now = new Date();
    
    // Calculate target dates for reminders (7 days and 1 day before event)
    const oneDayAhead = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format dates for database query (YYYY-MM-DD)
    const oneDayAheadStr = oneDayAhead.toISOString().slice(0, 10);
    const sevenDaysAheadStr = sevenDaysAhead.toISOString().slice(0, 10);
    
    console.log('📅 Looking for events on:', oneDayAheadStr, 'and', sevenDaysAheadStr);
    
    // Find events starting in exactly 1 day or 7 days
    const events = await Event.findAll({
      where: {
        date: {
          [Op.or]: [oneDayAheadStr, sevenDaysAheadStr]
        }
      }
    });
    
    console.log(`📊 Found ${events.length} events for reminders\n`);
    
    if (events.length === 0) {
      console.log('❌ No events found for reminders');
      console.log('💡 Run "node create-events.js" to create test events');
      return;
    }
    
    for (const event of events) {
      // Calculate days until event
      const eventDate = new Date(event.date);
      const daysUntil = Math.round((eventDate - now) / (24 * 60 * 60 * 1000));
      
      console.log(`🏃‍♂️ Event: ${event.name}`);
      console.log(`   📅 Date: ${event.date} (${daysUntil} days from now)`);
      
      // Find all applications for this event
      const applications = await EventApplication.findAll({
        where: { 
          eventId: event.id,
          status: 'approved' // Only send reminders to approved applications
        },
        include: [
          {
            model: User,
            as: 'user',
            where: { notificationEnabled: true } // Only users with notifications enabled
          }
        ]
      });
      
      console.log(`   👥 Found ${applications.length} approved applications with notifications enabled`);
      
      for (const application of applications) {
        const user = application.user;
        
        // Determine which reminder this is
        let subject, message;
        
        if (daysUntil === 7) {
          subject = `【RunMap】イベントリマインダー: ${event.name} - 1週間前`;
          message = `
${user.username} 様

${event.name} が1週間後に開催されます。

【イベント詳細】
・イベント名: ${event.name}
・開催日: ${event.date}
・開催場所: ${event.location}
・申込締切: ${event.applyDeadline}

準備を忘れずにお願いします！

RunMap
          `.trim();
        } else if (daysUntil === 1) {
          subject = `【RunMap】イベントリマインダー: ${event.name} - 明日開催`;
          message = `
${user.username} 様

${event.name} が明日開催されます！

【イベント詳細】
・イベント名: ${event.name}
・開催日: ${event.date}
・開催場所: ${event.location}

当日の準備をお忘れなく！

RunMap
          `.trim();
        } else {
          console.log(`   ⏭️  Skipping - not exactly 1 or 7 days (${daysUntil} days)`);
          continue;
        }
        
        try {
          console.log(`   📧 Sending reminder to ${user.email}...`);
          
          // Send email
          const messageId = await sendEmail(user.email, subject, message);
          
          if (messageId) {
            // Create notification
            await Notification.create({
              userId: user.id,
              message: `${event.name}のリマインダー: ${daysUntil === 7 ? '1週間前' : '明日開催'}`,
              isRead: false
            });
            
            console.log(`   ✅ Reminder sent successfully! (Message ID: ${messageId})`);
          } else {
            console.log(`   ❌ Failed to send reminder - no message ID returned`);
          }
          
        } catch (error) {
          console.error(`   ❌ Failed to send reminder to ${user.email}:`, error.message);
        }
      }
      
      console.log('');
    }
    
    console.log('🎯 Email reminder test completed!');
    console.log('\n📬 Check your email inbox for reminder messages');
    
  } catch (error) {
    console.error('❌ Error in email reminder test:', error.message);
  } finally {
    await sequelize.close();
  }
}

testEmailReminders(); 