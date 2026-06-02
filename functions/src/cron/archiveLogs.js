const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

// Runs every 1st of the month to archive logs older than 30 days
exports.archiveOldLogs = onSchedule('0 0 1 * *', async (event) => {
  const db = admin.firestore();
  
  // Create a date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const logsSnapshot = await db.collection('audit_logs')
    .where('timestamp', '<', thirtyDaysAgo)
    .get();

  if (logsSnapshot.empty) {
    console.log('No old logs to archive.');
    return;
  }

  const logsToArchive = [];
  logsSnapshot.forEach(doc => {
    logsToArchive.push({ id: doc.id, ...doc.data() });
  });

  const bucketName = process.env.ARCHIVE_BUCKET || `${process.env.GCLOUD_PROJECT}.appspot.com`;
  const bucket = storage.bucket(bucketName);
  
  const timestampStr = new Date().toISOString().split('T')[0];
  const file = bucket.file(`archives/audit_logs_${timestampStr}.json`);

  await file.save(JSON.stringify(logsToArchive, null, 2), {
    contentType: 'application/json'
  });

  console.log(`Archived ${logsToArchive.length} logs to ${file.name}.`);

  // Optionally delete them after archiving to save DB space
  // using batched writes
  const batch = db.batch();
  logsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Deleted archived logs from Firestore.');
});
