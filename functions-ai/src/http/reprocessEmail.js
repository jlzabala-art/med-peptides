const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// We require the worker logic from inboundEmail.js to reuse processEmailWorkflow
// Note: processEmailWorkflow is not currently exported from inboundEmail.js, we need to export it.
const { processEmailWorkflow } = require('./../webhooks/inboundEmail');

exports.reprocessEmail = onCall({ secrets: ['GEMINI_API_KEY'], memory: '1GiB', timeoutSeconds: 300 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated to reprocess emails.');
  }

  const { messageId, additionalContext } = request.data;

  if (!messageId) {
    throw new HttpsError('invalid-argument', 'messageId is required.');
  }

  const db = admin.firestore();
  
  try {
    // 1. Fetch original email
    const emailDoc = await db.collection('inbound_emails').doc(messageId).get();
    if (!emailDoc.exists) {
      throw new HttpsError('not-found', 'Original email not found in inbound_emails collection.');
    }
    
    const emailData = emailDoc.data();
    const { from, subject, textBody } = emailData;

    // 2. Set status to AI Processing in operations_queue to update UI
    await db.collection('operations_queue').doc(messageId).update({
      status: 'AI Processing',
      outcome: 'Reprocessing with AI...',
      activityLog: admin.firestore.FieldValue.arrayUnion({
        id: Date.now(),
        action: 'Manual Reprocessing Requested',
        time: new Date().toLocaleTimeString(),
        actor: request.auth.token.email || 'Admin'
      })
    }).catch(e => {
       // Ignore if doc doesn't exist, processEmailWorkflow will create it
       console.log("Could not update queue doc before reprocessing", e);
    });

    // 3. Re-run workflow, passing additionalContext
    await processEmailWorkflow(messageId, textBody, subject, from, additionalContext);

    return { success: true, message: 'Reprocessed successfully.' };
  } catch (error) {
    console.error("Error in reprocessEmail:", error);
    
    // Attempt to set failed status back
    await db.collection('operations_queue').doc(messageId).update({
      status: 'Failed',
      outcome: 'AI Parsing Failed Again',
    }).catch(e => console.error(e));
    
    throw new HttpsError('internal', error.message || 'Reprocessing failed.');
  }
});
