const { onCall, HttpsError } = require("firebase-functions/v2/https");

// EmailJS Credentials
const EMAILJS_SERVICE_ID = 'service_vstbe8f';
const EMAILJS_PUBLIC_KEY = 'rO_f_X4uBvFf3u_3u';

exports.sendEmail = onCall({ cors: true }, async (request) => {
  const { auth, data } = request;

  // 1. Authentication check
  if (!auth) {
    throw new HttpsError("unauthenticated", "You must be authenticated to send emails.");
  }

  // 2. Validate parameters
  const { templateId, templateParams } = data;
  if (!templateId || !templateParams) {
    throw new HttpsError("invalid-argument", "Missing templateId or templateParams.");
  }

  // 3. Send email via EmailJS REST API
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS Error:", errorText);
      throw new HttpsError("internal", "Email dispatch failed at provider.");
    }

    return { success: true, message: "Email sent successfully via secure backend." };
  } catch (error) {
    console.error("sendEmail execution error:", error);
    throw new HttpsError("internal", "Failed to send email.");
  }
});
