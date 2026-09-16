const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { buildOrderEmail } = require("../../emailTemplates/orderNotification");
const { buildClientConfirmationEmail } = require("../../emailTemplates/clientConfirmation");

const isDeliverableEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  if (
    normalized.endsWith(".test") ||
    normalized.endsWith(".example") ||
    normalized.endsWith(".invalid") ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith("@example.com")
  ) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

module.exports = (gmailUser, gmailAppPass) => onDocumentCreated(
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

    const db = getFirestore();
    const adminSnap = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();

    const nodemailer = require("nodemailer");
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
    const sendPromises = [];

    let adminEmails = [];
    if (!adminSnap.empty) {
      adminEmails = adminSnap.docs
        .map((doc) => doc.data().email)
        .filter(isDeliverableEmail);
    }

    // Default to primary administrator if no deliverable admins found
    if (adminEmails.length === 0) {
      adminEmails = ["jose@mediluxeme.com"];
    }

    const { subject, html } = buildOrderEmail(orderData);
    adminEmails.forEach((to) => {
      sendPromises.push(
        transporter.sendMail({ from: fromAddress, to, subject, html })
      );
    });

    const customerEmail = orderData.customer?.email;
    if (customerEmail && isDeliverableEmail(customerEmail)) {
      const { subject: clientSubject, html: clientHtml } = buildClientConfirmationEmail(orderData);
      sendPromises.push(
        transporter.sendMail({ from: fromAddress, to: customerEmail, subject: clientSubject, html: clientHtml })
      );
    }

    await Promise.all(sendPromises);
    console.log(`✅ All deliverable emails sent for order ${orderId} (Admins: ${adminEmails.join(', ')})`);
  }
);
