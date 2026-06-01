const { onRequest, onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const firestoreAPI = require('@google-cloud/firestore');
const client = new firestoreAPI.v1.FirestoreAdminClient();
const BUCKET_NAME = 'gs://regenpept-backups';

exports.triggerManualBackup = onCall(async (request) => {
  try {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    
    // Start export
    const responses = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: BUCKET_NAME,
      collectionIds: [] 
    });

    // Log to Firestore
    await admin.firestore().collection('system_backups').add({
      type: 'Database Export',
      source: 'Firestore Admin API',
      status: 'Success',
      triggeredBy: 'Manual',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: `Started manual export operation: ${responses[0]['name']}`
    });

    return { success: true, message: 'Backup triggered successfully.' };
  } catch (error) {
    console.error('Error triggering manual backup:', error);
    await admin.firestore().collection('system_backups').add({
      type: 'Database Export',
      source: 'Firestore Admin API',
      status: 'Failed',
      triggeredBy: 'Manual',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: error.message
    });
    throw new require('firebase-functions/v2/https').HttpsError('internal', error.message);
  }
});

exports.logGitBackup = onRequest({ cors: true }, async (req, res) => {
  // Simple webhook to log local Git backups
  // In production, require an API key or secret token
  const { status, commitHash, details } = req.body;
  
  try {
    await admin.firestore().collection('system_backups').add({
      type: 'Code Repository',
      source: 'Git Version Control',
      status: status || 'Success',
      triggeredBy: 'Cron (Nightly)',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: details || `Backup committed to GitHub. Hash: ${commitHash || 'N/A'}`
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
