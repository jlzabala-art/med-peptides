const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { buildOrderEmail } = require("./emailTemplates/orderNotification");

initializeApp();

// Gmail credentials — set with:
//   firebase functions:secrets:set GMAIL_USER
//   firebase functions:secrets:set GMAIL_APP_PASS
const gmailUser = defineSecret("GMAIL_USER");
const gmailAppPass = defineSecret("GMAIL_APP_PASS");

/**
 * Triggered whenever a new document is created in the `orders` collection.
 * Fetches all admin users from Firestore and sends them an HTML order email
 * via Gmail SMTP using an App Password.
 */
exports.onNewOrder = onDocumentCreated(
  {
    document: "orders/{orderId}",
    secrets: [gmailUser, gmailAppPass],
    region: "europe-west1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.error("No data in event snapshot.");
      return;
    }

    const orderId = event.params.orderId;
    const orderData = { id: orderId, ...snap.data() };

    // 1. Find all admin emails from Firestore
    const db = getFirestore();
    const adminSnap = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();

    if (adminSnap.empty) {
      console.warn("No admin users found. Skipping email notification.");
      return;
    }

    const adminEmails = adminSnap.docs
      .map((doc) => doc.data().email)
      .filter(Boolean);

    if (adminEmails.length === 0) {
      console.warn("Admin users found but none have an email field.");
      return;
    }

    // 2. Gmail SMTP transporter (requires App Password, not regular password)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: gmailUser.value(),
        pass: gmailAppPass.value(), // 16-char App Password from Google Account
      },
    });

    // 3. Build and send email to every admin
    const { subject, html } = buildOrderEmail(orderData);
    const fromAddress = `"Med-Peptides" <${gmailUser.value()}>`;

    const sendPromises = adminEmails.map((to) =>
      transporter.sendMail({ from: fromAddress, to, subject, html })
    );

    await Promise.all(sendPromises);
    console.log(
      `✅ Order ${orderId} notification sent to: ${adminEmails.join(", ")}`
    );
  }
);
