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

  // Send notifications via SendGrid, SMS stub, or FCM
  for (const notif of notifications) {
    console.log(`[Reminders] Sending ${notif.method} to ${notif.uid}: ${notif.title}`);
    
    try {
      if (notif.method === 'email') {
        // Example SendGrid/Nodemailer dispatch
        // await sendGrid.send({ to: userEmail, from: 'noreply@atlashealth.com', subject: notif.title, text: notif.body });
        console.log(`[Email Dispatch Stub] To UID: ${notif.uid} | Subject: ${notif.title}`);
      } else if (notif.method === 'sms') {
        // Console-log SMS stub
        console.log(`[SMS Dispatch Stub] To UID: ${notif.uid} | Message: ${notif.title} - ${notif.body}`);
      } else if (notif.method === 'push') {
        // FCM push (admin-sdk)
        // Ensure user has FCM tokens saved in their user profile
        // const userDoc = await db.collection('users').doc(notif.uid).get();
        // const fcmToken = userDoc.data()?.fcmToken;
        // if (fcmToken) {
        //   await require('firebase-admin/messaging').getMessaging().send({
        //     token: fcmToken,
        //     notification: { title: notif.title, body: notif.body }
        //   });
        // }
        console.log(`[FCM Push Dispatch Stub] To UID: ${notif.uid} | Title: ${notif.title}`);
      }
    } catch (err) {
      console.error(`[Reminders Error] Failed to send ${notif.method} to ${notif.uid}:`, err);
    }
  }
});
