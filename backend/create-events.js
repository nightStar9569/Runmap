const { sequelize } = require('./models');
const Event = require('./models').Event;
const User = require('./models').User;
const EventApplication = require('./models').EventApplication;
const bcrypt = require('bcrypt');

async function createEvents() {
  console.log('🏃‍♂️ Creating Sample Events...\n');
  
  try {
    // Get current date
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Create or find test user
    let testUser = await User.findOne({ where: { username: 'testuser' } });
    
    if (!testUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com', // Replace with your email
        password: hashedPassword,
        membershipStatus: 'paid',
        notificationEnabled: true,
        phone: '1234567890',
        address: 'Tokyo, Japan'
      });
      console.log('✅ Test user created:', testUser.username);
    } else {
      console.log('✅ Test user found:', testUser.username);
    }
    
    // Create events
    const events = [
      {
        name: '東京マラソン 2025',
        description: '日本最大級のマラソン大会。東京の街を駆け抜ける感動の42.195km。',
        date: tomorrow.toISOString().slice(0, 10),
        location: '東京都',
        applyDeadline: now.toISOString().slice(0, 10)
      },
      {
        name: '大阪マラソン 2025',
        description: '大阪城をスタートし、大阪の名所を巡る美しいコース。',
        date: sevenDaysFromNow.toISOString().slice(0, 10),
        location: '大阪府',
        applyDeadline: now.toISOString().slice(0, 10)
      }
    ];
    
    console.log('📅 Creating events:');
    console.log('- Tomorrow:', tomorrow.toISOString().slice(0, 10));
    console.log('- 7 days:', sevenDaysFromNow.toISOString().slice(0, 10));
    console.log('');
    
    // Create events
    for (const eventData of events) {
      const event = await Event.create(eventData);
      console.log(`✅ Created: ${event.name} (${event.date})`);
      
      // Create approved application
      const application = await EventApplication.create({
        userId: testUser.id,
        eventId: event.id,
        status: 'approved'
      });
      console.log(`   📝 Application: ${testUser.username} -> ${event.name} (approved)`);
    }
    
    console.log('\n🎯 Events created successfully!');
    console.log('\n🧪 To test email reminders:');
    console.log('1. Make sure email is configured in .env file');
    console.log('2. Run: node test-email-simple.js');
    console.log('3. Run: node test-email-reminders.js');
    
  } catch (error) {
    console.error('❌ Error creating events:', error.message);
  } finally {
    await sequelize.close();
  }
}

createEvents(); 