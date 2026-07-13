const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

exports.acceptInvitation = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { inviteId } = request.data;
  if (!inviteId) {
    throw new HttpsError('invalid-argument', 'Missing inviteId.');
  }

  const db = getFirestore();

  try {
    return await db.runTransaction(async (transaction) => {
      const invRef = db.collection('invitations').doc(inviteId);
      const invSnap = await transaction.get(invRef);

      if (!invSnap.exists) {
        throw new HttpsError('not-found', 'Invitation not found.');
      }

      const invData = invSnap.data();

      if (invData.status !== 'pending') {
        throw new HttpsError('failed-precondition', 'Invitation is no longer pending.');
      }

      // Check if user is trying to claim an invitation not matching their email
      // (Optional security check, depending on business rules. We'll skip strict email check 
      // here if they have the explicit ID, but it's good practice).
      
      const userRef = db.collection('users').doc(uid);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new HttpsError('not-found', 'User profile not found.');
      }

      // 1. Mark invitation as accepted
      transaction.update(invRef, {
        status: 'accepted',
        acceptedAt: FieldValue.serverTimestamp(),
        userId: uid
      });

      // 2. Update user profile with roles and account manager
      const roleToAssign = invData.roles ? invData.roles[0] : (invData.role || 'patient');
      const assignedManagerId = invData.createdBy;

      const userUpdate = {
        role: roleToAssign,
        approved: true, // auto-approve invited users
        professionalStatus: 'approved'
      };

      if (invData.roles) {
        userUpdate.roles = invData.roles;
      }

      if (assignedManagerId) {
        userUpdate.assignedAccountManagerId = assignedManagerId;
        
        // 3. Create a notification for the Account Manager
        const notifRef = db.collection('notifications').doc();
        transaction.set(notifRef, {
          recipientId: assignedManagerId,
          type: 'new_client',
          title: 'New Client Registered',
          message: `A user has accepted your invitation and registered as a ${roleToAssign}.`,
          link: `/account-manager/clients/${uid}`,
          read: false,
          createdAt: FieldValue.serverTimestamp()
        });
      }

      transaction.update(userRef, userUpdate);

      return { success: true, roleAssigned: roleToAssign, managerAssigned: assignedManagerId };
    });
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    throw new HttpsError('internal', error.message || 'Transaction failed');
  }
});
