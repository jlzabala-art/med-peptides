const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { buildOrderEmail } = require("./emailTemplates/orderNotification");
const { buildClientConfirmationEmail } = require("./emailTemplates/clientConfirmation");

initializeApp();

// Gmail credentials — set with:
//   firebase functions:secrets:set GMAIL_USER
//   firebase functions:secrets:set GMAIL_APP_PASS
const gmailUser = defineSecret("GMAIL_USER");
const gmailAppPass = defineSecret("GMAIL_APP_PASS");

/**
 * Triggered whenever a new document is created in the `orders` collection.
 * 1. Fetches all admin users from Firestore and sends them an HTML order email.
 * 2. Sends a confirmation email to the customer who placed the order.
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

    const fromAddress = `"Med-Peptides" <${gmailUser.value()}>`;
    const sendPromises = [];

    // 3a. Send notification to every admin
    if (!adminSnap.empty) {
      const adminEmails = adminSnap.docs
        .map((doc) => doc.data().email)
        .filter(Boolean);

      if (adminEmails.length > 0) {
        const { subject, html } = buildOrderEmail(orderData);
        adminEmails.forEach((to) => {
          sendPromises.push(
            transporter.sendMail({ from: fromAddress, to, subject, html })
          );
        });
        console.log(
          `📧 Admin notification queued for: ${adminEmails.join(", ")}`
        );
      } else {
        console.warn("Admin users found but none have an email field.");
      }
    } else {
      console.warn("No admin users found. Skipping admin notification.");
    }

    // 3b. Send confirmation email to the customer
    const customerEmail = orderData.customer?.email;
    if (customerEmail) {
      const { subject, html } = buildClientConfirmationEmail(orderData);
      sendPromises.push(
        transporter.sendMail({ from: fromAddress, to: customerEmail, subject, html })
      );
      console.log(`📧 Client confirmation queued for: ${customerEmail}`);
    } else {
      console.warn("Order has no customer email. Skipping client confirmation.");
    }

    // 4. Send all emails concurrently
    await Promise.all(sendPromises);
    console.log(`✅ All emails sent for order ${orderId}`);
  }
);
