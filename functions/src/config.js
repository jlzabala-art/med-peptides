const { defineSecret } = require("firebase-functions/params");

const gmailUser = defineSecret("GMAIL_USER");
const gmailAppPass = defineSecret("GMAIL_APP_PASS");
const ga4PropertyId = defineSecret("GA4_PROPERTY_ID");

module.exports = {
  gmailUser,
  gmailAppPass,
  ga4PropertyId
};
