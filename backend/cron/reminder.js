const cron = require('node-cron');
const { Op } = require('sequelize');
const Event = require('../models').Event;
const Favorite = require('../models').Favorite;
const User = require('../models').User;
const Notification = require('../models').Notification;
const { sendEmail } = require('../utils/email');

cron.schedule('0 0 * * *', async () => { // every day at midnight
  const now = new Date();

  // Calculate target dates for reminders
  const oneDayAhead = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find events starting in exactly 1 day or 7 days
  const events = await Event.findAll({
    where: {
      date: {
        [Op.or]: [
          oneDayAhead.toISOString().slice(0, 10), // YYYY-MM-DD
          sevenDaysAhead.toISOString().slice(0, 10)
        ]
      }
    }
  });

  for (const event of events) {
    const favorites = await Favorite.findAll({ where: { eventId: event.id } });
    for (const fav of favorites) {
      const user = await User.findByPk(fav.userId);
      if (user && user.membershipStatus === 'paid' && user.notificationEnabled) {
        // Determine which reminder this is
        const daysUntil = Math.round((new Date(event.date) - now) / (24 * 60 * 60 * 1000));
        let message, subject;
        if (daysUntil === 7) {
          subject = 'Event Reminder: 1 Week Left!';
          message = `Reminder: ${event.name} is happening in 1 week!`;
        } else if (daysUntil === 1) {
          subject = 'Event Reminder: Tomorrow!';
          message = `Reminder: ${event.name} is happening tomorrow!`;
        } else {
          continue; // Shouldn't happen, but just in case
        }
        await Notification.create({ userId: user.id, message, isRead: false });
        await sendEmail(user.email, subject, message);
      }
    }
  }
});
