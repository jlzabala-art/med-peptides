const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");

exports.sendReminders = onSchedule("every 5 minutes", async (event) => {
  const now = new Date();
  const soon = new Date(now.getTime() + 15 * 60000); // Next 15 mins

  const eventsSnap = await getFirestore()
    .collection('calendar_events')
    .where('start', '>=', now.toISOString())
    .where('start', '<=', soon.toISOString())
    .where('reminderSent', '==', false)
    .get();

  const batch = getFirestore().batch();

  eventsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`[Calendar] Sending reminder for event: ${data.title}`);
    // Mock logic for sending Email (SendGrid), SMS (Twilio), Push (FCM)
    // SendGrid.send(...), Twilio.messages.create(...), FCM.send(...)
    
    batch.update(doc.ref, { reminderSent: true });
  });

  if (!eventsSnap.empty) {
    await batch.commit();
  }
});
