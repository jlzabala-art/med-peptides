const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');

// Runs every 5 minutes to scan for upcoming events and send reminders
exports.sendCalendarReminders = onSchedule('every 5 minutes', async (event) => {
  const db = getFirestore();
  const now = new Date();
  
  // Lookahead window (e.g., next 60 minutes)
  const lookaheadTime = new Date(now.getTime() + 60 * 60 * 1000); 
  
  // Note: Firestore querying for dates should be indexed appropriately
  const snapshot = await db.collection('calendar_events')
    .where('start', '>=', now.toISOString())
    .where('start', '<=', lookaheadTime.toISOString())
    .get();

  if (snapshot.empty) {
    console.log('[Reminders] No upcoming events found for reminders.');
    return;
  }

  const notifications = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.reminders) return;

    data.reminders.forEach(reminder => {
      // Logic to check if the reminder offset matches the current time
      // For instance, if reminder.offsetMinutes is 15, and start is in ~15 mins
      
      const eventStart = new Date(data.start);
      const reminderTime = new Date(eventStart.getTime() - (reminder.offsetMinutes * 60 * 1000));
      
      // If reminder is due now (within the 5-min window)
      if (Math.abs(now.getTime() - reminderTime.getTime()) < 5 * 60 * 1000) {
        data.ownerIds.forEach(uid => {
          notifications.push({
            uid,
            method: reminder.method, // 'email', 'sms', 'push'
            title: `Reminder: ${data.title}`,
            body: `Your event starts at ${eventStart.toLocaleTimeString()}`
          });
        });
      }
    });
  });

  // Placeholder for sending notifications via SendGrid, Twilio, or FCM
  for (const notif of notifications) {
    console.log(`[Reminders] Sending ${notif.method} to ${notif.uid}: ${notif.title}`);
    // if (notif.method === 'email') sendGrid.send(...)
    // if (notif.method === 'sms') twilio.messages.create(...)
    // if (notif.method === 'push') fcm.send(...)
  }
});
