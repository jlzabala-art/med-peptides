const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const { buildWelcomeEmail } = require("../../emailTemplates/welcomeUser");
const { buildAdminNewUserAlertEmail } = require("../../emailTemplates/adminNewUserAlert");
const { sanitizeTestEmail } = require("../lib/safetyEmailGuard");

const ADMIN_ALERT_EMAIL = "jose@mediluxeme.com";

module.exports = (gmailUser, gmailAppPass) => onDocumentCreated(
  {
    document: "users/{userId}",
    secrets: [gmailUser, gmailAppPass],
    region: "europe-west1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.error("No data in user event snapshot.");
      return;
    }

    const userData = snap.data();
    const userId = event.params.userId;
    const customerEmail = userData.email;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: gmailUser.value(),
        pass: gmailAppPass.value(),
      },
    });

    const fromAddress = `"Atlas Health" <${gmailUser.value()}>`;

    // 1. Send Admin Alert Email to jose@mediluxeme.com
    try {
      const adminAlert = buildAdminNewUserAlertEmail(userData, userId);
      const safeAdminMail = sanitizeTestEmail({
        from: fromAddress,
        to: ADMIN_ALERT_EMAIL,
        subject: adminAlert.subject,
        text: adminAlert.text,
        html: adminAlert.html,
        headers: {
          "X-Priority": "1 (Highest)",
          "X-MSMail-Priority": "High",
          "Importance": "High",
        },
      }, "admin");

      await transporter.sendMail(safeAdminMail);
      console.log(`✅ [onUserCreated] Admin alert email successfully dispatched to: ${ADMIN_ALERT_EMAIL} for user: ${userId}`);
    } catch (adminErr) {
      console.error(`❌ [onUserCreated] Failed to dispatch admin alert email to ${ADMIN_ALERT_EMAIL}:`, adminErr);
    }

    // 2. Send Welcome Email to the registered user (if deliverable email present)
    if (customerEmail) {
      try {
        const { subject, html } = buildWelcomeEmail(userData);
        const safeCustomerMail = sanitizeTestEmail({
          from: fromAddress,
          to: customerEmail,
          subject,
          html,
        }, "new-user");

        await transporter.sendMail(safeCustomerMail);
        console.log(`📧 [onUserCreated] Safe welcome email processed for customer: ${customerEmail}`);
      } catch (custErr) {
        console.error("❌ [onUserCreated] Failed to send welcome email to customer:", custErr);
      }
    }
  }
);
