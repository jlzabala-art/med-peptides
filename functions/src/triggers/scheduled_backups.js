const { onSchedule } = require('firebase-functions/v2/scheduler');
const firestore = require('@google-cloud/firestore');
const admin = require('firebase-admin');
const client = new firestore.v1.FirestoreAdminClient();

// Reemplace 'regenpept-backups' con el nombre real de su bucket en GCS
const BUCKET_NAME = 'gs://regenpept-backups';

/**
 * Cloud Function Scheduled Export: Runs every day at 02:00 AM.
 * Exports all Firestore collections to the specified Cloud Storage bucket.
 */
exports.scheduledFirestoreExport = onSchedule({
  schedule: '0 2 * * *', // 02:00 AM every day
  timeZone: 'Europe/Madrid', // Replace with your desired timezone
  timeoutSeconds: 540,
  memory: '256MiB'
}, async (event) => {
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = client.databasePath(projectId, '(default)');

  try {
    const responses = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: BUCKET_NAME,
      // Leave collectionIds empty to export all collections
      collectionIds: [] 
    });

    // Log to Firestore
    await admin.firestore().collection('system_backups').add({
      type: 'Database Export',
      source: 'Firestore Admin API',
      status: 'Success',
      triggeredBy: 'Cron (Nightly)',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: `Started scheduled export operation: ${responses[0]['name']}`
    });

    console.log(`Successfully started export operation: ${responses[0]['name']}`);
  } catch (error) {
    console.error('Error exporting Firestore data:', error);
    await admin.firestore().collection('system_backups').add({
      type: 'Database Export',
      source: 'Firestore Admin API',
      status: 'Failed',
      triggeredBy: 'Cron (Nightly)',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: error.message
    });
    throw new Error('Export operation failed');
  }
});
