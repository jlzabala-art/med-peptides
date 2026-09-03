const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");

exports.onPrescriptionStatusChange = onDocumentUpdated("prescriptions/{prescriptionId}", async (event) => {
  const newValue = event.data.after.data();
  const previousValue = event.data.before.data();

  // We only care if the status changed
  if (newValue.status === previousValue.status) return null;

  const patientId = newValue.patientId;
  if (!patientId) return null;

  // Get the patient to find their FCM token
  const db = getFirestore();
  const patientDoc = await db.collection("users").doc(patientId).get();
  if (!patientDoc.exists) return null;

  const fcmToken = patientDoc.data().fcmToken;
  if (!fcmToken) {
    console.log(`No FCM token found for user ${patientId}`);
    return null;
  }

  // Construct message
  const message = {
    notification: {
      title: `Prescription Update`,
      body: `Your prescription for ${newValue.protocolName || 'RegenPept Protocol'} is now ${newValue.status}.`,
    },
    data: {
      prescriptionId: event.params.prescriptionId,
      status: newValue.status,
      type: "PRESCRIPTION_UPDATE"
    },
    token: fcmToken,
  };

  try {
    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});
