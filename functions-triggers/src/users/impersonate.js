const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

exports.generateImpersonationToken = onCall(async (request) => {
  // 1. Verify caller is authenticated
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "You must be logged in to impersonate.");
  }

  // 2. Verify caller is an admin
  const db = getFirestore();
  const callerDoc = await db.collection("users").doc(request.auth.uid).get();
  
  if (!callerDoc.exists) {
    throw new HttpsError("permission-denied", "User record not found.");
  }
  
  const callerData = callerDoc.data();
  if (callerData.role !== "admin") {
    throw new HttpsError("permission-denied", "Only administrators can impersonate users.");
  }

  // 3. Get target UID from request data
  const targetUid = request.data.targetUid;
  if (!targetUid) {
    throw new HttpsError("invalid-argument", "targetUid is required.");
  }

  try {
    // 4. Verify target user exists in Auth
    await getAuth().getUser(targetUid);
    
    // 5. Generate custom token
    // We add a custom claim 'isImpersonated' so the client knows this is an impersonation session
    const customToken = await getAuth().createCustomToken(targetUid, { 
      isImpersonated: true,
      impersonatorUid: request.auth.uid
    });
    
    // 6. Log the impersonation event for security
    await db.collection('audit_logs').add({
      action: 'IMPERSONATE_USER',
      adminUid: request.auth.uid,
      adminEmail: request.auth.token.email || callerData.email,
      targetUid: targetUid,
      timestamp: new Date()
    });

    return { customToken };
  } catch (error) {
    console.error("Error generating custom token:", error);
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError("not-found", "The target user does not exist.");
    }
    throw new HttpsError("internal", "Unable to generate impersonation token.");
  }
});
