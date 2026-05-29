const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { buildOrderEmail } = require("../../emailTemplates/orderNotification");
const { buildClientConfirmationEmail } = require("../../emailTemplates/clientConfirmation");

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
      }
    }

    const customerEmail = orderData.customer?.email;
    if (customerEmail) {
      const { subject, html } = buildClientConfirmationEmail(orderData);
      sendPromises.push(
        transporter.sendMail({ from: fromAddress, to: customerEmail, subject, html })
      );
    }

    await Promise.all(sendPromises);
    console.log(`✅ All emails sent for order ${orderId}`);
  }
);
