const { sequelize } = require('./models');
const Event = require('./models').Event;
const User = require('./models').User;
const EventApplication = require('./models').EventApplication;

async function viewEvents() {
  console.log('📋 Current Events in Database\n');
  
  try {
    // Get all events with applications
    const events = await Event.findAll({
      include: [
        {
          model: EventApplication,
          as: 'applications',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'membershipStatus', 'notificationEnabled']
            }
          ]
        }
      ],
      order: [['date', 'ASC']]
    });
    
    if (events.length === 0) {
      console.log('❌ No events found in database');
      console.log('\n💡 To create sample events, run: node create-sample-events.js');
      return;
    }
    
    console.log(`📊 Found ${events.length} events:\n`);
    
    const now = new Date();
    
    events.forEach((event, index) => {
      const daysUntil = Math.round((new Date(event.date) - now) / (24 * 60 * 60 * 1000));
      const isReminderDay = daysUntil === 1 || daysUntil === 7;
      
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   📅 Date: ${event.date} (${daysUntil} days from now)`);
      console.log(`   📍 Location: ${event.location}`);
      console.log(`   📝 Description: ${event.description}`);
      console.log(`   ⏰ Apply Deadline: ${event.applyDeadline}`);
      
      if (event.applications && event.applications.length > 0) {
        console.log(`   👥 Applications: ${event.applications.length}`);
        event.applications.forEach(app => {
          const status = app.status === 'approved' ? '✅' : app.status === 'pending' ? '⏳' : '❌';
          const reminder = app.status === 'approved' && app.user.notificationEnabled && 
                          app.user.membershipStatus === 'paid' && isReminderDay ? '📧 Will receive reminder' : '';
          console.log(`      ${status} ${app.user.username} (${app.user.email}) - ${app.status} ${reminder}`);
        });
      } else {
        console.log(`   👥 Applications: 0`);
      }
      
      if (isReminderDay) {
        console.log(`   🎯 REMINDER DAY: ${daysUntil === 1 ? '1-day reminder' : '7-day reminder'}`);
      }
      
      console.log('');
    });
    
    // Summary
    const reminderEvents = events.filter(event => {
      const daysUntil = Math.round((new Date(event.date) - now) / (24 * 60 * 60 * 1000));
      return daysUntil === 1 || daysUntil === 7;
    });
    
    const approvedApplications = events.reduce((total, event) => {
      return total + (event.applications?.filter(app => app.status === 'approved').length || 0);
    }, 0);
    
    console.log('📈 Summary:');
    console.log(`- Total events: ${events.length}`);
    console.log(`- Events with reminders today: ${reminderEvents.length}`);
    console.log(`- Total approved applications: ${approvedApplications}`);
    
    if (reminderEvents.length > 0) {
      console.log('\n🧪 To test email reminders:');
      console.log('node test-email-reminders.js');
    }
    
  } catch (error) {
    console.error('❌ Error viewing events:', error.message);
  } finally {
    await sequelize.close();
  }
}

viewEvents(); 