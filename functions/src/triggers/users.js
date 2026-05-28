const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const { buildWelcomeEmail } = require("../../emailTemplates/welcomeUser");

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
    const customerEmail = userData.email;

    if (!customerEmail) return;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: gmailUser.value(),
        pass: gmailAppPass.value(),
      },
    });

    const fromAddress = `"Med-Peptides" <${gmailUser.value()}>`;
    const { subject, html } = buildWelcomeEmail(userData);

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: customerEmail,
        subject,
        html,
      });
      console.log(`📧 Welcome email sent to: ${customerEmail}`);
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
  }
);
