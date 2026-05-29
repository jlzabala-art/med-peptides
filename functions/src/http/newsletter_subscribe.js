"use strict";
/**
 * newsletter_subscribe.js — Public subscription endpoint
 *
 * POST /newsletterSubscribe
 * Body: { email, preferences: { goal, level, areas } }
 * No auth required (public endpoint)
 *
 * Actions:
 *  1. Validates email
 *  2. Checks for duplicates in newsletter_subscribers
 *  3. Writes subscriber document
 *  4. Sends welcome email via Gmail
 */

const { onRequest }       = require("firebase-functions/v2/https");
const { getFirestore }    = require("firebase-admin/firestore");
const { defineSecret }     = require("firebase-functions/params");
const { structuredLogger }= require("./ai_utils");
const nodemailer          = require("nodemailer");
const crypto              = require("crypto");
const { gmailUser, gmailAppPass } = require("../config");

// Zoho Bigin Config and secrets declarations
const {
  ZOHO_ORG_ID,
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_BOOKS_BASE_URL,
  ZOHO_BOOKS_BASE_URL_GLOBAL,
  ZOHO_SECRETS,
} = require("../lib/zoho_config");

const zohoClientId     = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

// ── Helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e));

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

// ── Welcome email HTML ────────────────────────────────────────────────────────

const GOAL_LABEL = {
  recovery:    "Recovery & Repair",
  longevity:   "Longevity",
  cognitive:   "Cognitive & Mood",
  sleep:       "Sleep & Circadian",
  metabolic:   "Metabolic Health",
  performance: "Athletic Performance",
  hormonal:    "Hormonal Balance",
};

const GOAL_EMOJI = {
  recovery: "🔬", longevity: "🧬", cognitive: "🧠",
  sleep: "🌙", metabolic: "⚡", performance: "💪", hormonal: "⚖️",
};

function buildWelcomeEmail(preferences, unsubscribeToken) {
  const goal     = preferences?.goal || null;
  const level    = preferences?.level || null;
  const goalLabel = goal ? GOAL_LABEL[goal] || goal : null;
  const goalEmoji = goal ? GOAL_EMOJI[goal] || "🧬" : "🧬";

  const subject = goalLabel
    ? `Welcome to your ${goalLabel} Research Digest 🎉`
    : "Welcome to Atlas Health Weekly Research Digest 🎉";

  const personalizedIntro = goalLabel
    ? `We've set up your personalized <strong>${goalLabel}</strong> research digest. Every Monday you'll receive curated insights, protocol updates, and research summaries tailored to your goals.`
    : `Every Monday you'll receive curated peptide research insights, protocol updates, and health optimization summaries — designed for your level.`;

  const levelText = level
    ? `<p style="margin:0 0 16px;color:#64748b;font-size:14px;">Your experience level: <strong>${level.charAt(0).toUpperCase() + level.slice(1)}</strong> — we'll calibrate the depth of content accordingly.</p>`
    : "";

  const unsubUrl = `https://med-peptides.com/unsubscribe?token=${unsubscribeToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:580px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f0f1a,#0d1629);padding:28px 32px;text-align:center;">
      <div style="font-size:28px;margin-bottom:8px;">${goalEmoji}</div>
      <span style="color:#6366f1;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Atlas Health Research</span>
      <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:4px;letter-spacing:0.05em;text-transform:uppercase;">Weekly Research Digest</div>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">
        Welcome aboard! 🎉
      </h1>
      <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
        ${personalizedIntro}
      </p>
      ${levelText}

      <!-- What to expect -->
      <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin:20px 0;border:1px solid #e2e8f0;">
        <p style="margin:0 0 10px;font-weight:700;color:#0f172a;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">What to expect each week</p>
        <ul style="margin:0;padding-left:18px;color:#475569;font-size:14px;line-height:1.9;">
          <li>New research highlights in plain language</li>
          <li>Protocol tips matched to your goal</li>
          <li>Compound spotlights and dosing insights</li>
          <li>Curated links to the latest science</li>
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:24px 0;">
        <a href="https://med-peptides.com"
           style="display:inline-block;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.01em;">
          Explore the Research Platform →
        </a>
      </div>

      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
        Your first digest arrives next Monday. In the meantime, feel free to explore our catalog, ask our ClinicalAI any research questions, or browse the latest protocols.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.8;">
        Atlas Health Research Platform · research@med-peptides.com<br>
        <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
        · For educational and research purposes only.
      </p>
    </div>

  </div>
</body>
</html>`;

  return { subject, html };
}

// ── Main handler ──────────────────────────────────────────────────────────────

const handler = onRequest(
  { secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken], region: "europe-west1", timeoutSeconds: 30 },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
      const { email, preferences = {} } = req.body || {};

      // ── Validation ────────────────────────────────────────────────────────
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email address." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = getFirestore();

      // ── Duplicate check ───────────────────────────────────────────────────
      const existing = await db
        .collection("newsletter_subscribers")
        .where("email", "==", normalizedEmail)
        .limit(1)
        .get();

      if (!existing.empty) {
        // Already subscribed — return 409 so frontend shows success gracefully
        return res.status(409).json({ error: "Already subscribed." });
      }

      // ── Write subscriber doc ──────────────────────────────────────────────
      const unsubscribeToken = generateToken();
      const now = new Date().toISOString();

      const subscriberRef = db.collection("newsletter_subscribers").doc();
      await subscriberRef.set({
        email: normalizedEmail,
        preferences: {
          goal:  preferences.goal  || null,
          level: preferences.level || null,
          areas: Array.isArray(preferences.areas) ? preferences.areas : [],
        },
        subscribedAt:     now,
        lastSentAt:       null,
        active:           true,
        unsubscribeToken,
        source:           "guest_home_section",
      });

      // ── Zoho Bigin: Add lead as Contact ──────────────────────────────────
      try {
        const oauthUrls = [ZOHO_OAUTH_URL, ZOHO_OAUTH_URL_GLOBAL];
        let accessToken = null;
        for (const oauthUrl of oauthUrls) {
          try {
            const oauthParams = new URLSearchParams({
              grant_type:    "refresh_token",
              client_id:     zohoClientId.value(),
              client_secret: zohoClientSecret.value().replace(/\n/g, ""),
              refresh_token: zohoRefreshToken.value().replace(/\n/g, ""),
            });
            const oauthRes = await fetch(`${oauthUrl}?${oauthParams}`, { method: "POST" });
            if (oauthRes.ok) {
              const oauthData = await oauthRes.json();
              if (oauthData.access_token) {
                accessToken = oauthData.access_token;
                break;
              }
            }
          } catch (e) {
            console.warn(`[Zoho OAuth] Failed for ${oauthUrl}:`, e.message);
          }
        }

        if (accessToken) {
          const biginEndpoints = [
            "https://www.zohoapis.me/bigin/v1/Contacts",
            "https://www.zohoapis.com/bigin/v1/Contacts"
          ];
          
          const leadPayload = {
            data: [{
              Last_Name: normalizedEmail.split('@')[0], // Last Name is mandatory in Zoho Contacts
              Email: normalizedEmail,
              Description: `Subscribed via Atlas Health Newsletter. Preferred Goal: ${preferences.goal || 'default'}. Level: ${preferences.level || 'default'}.`,
              Tag: [{ name: "Atlas Health Mailing" }]
            }]
          };

          for (const endpoint of biginEndpoints) {
            try {
              const biginRes = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Authorization": `Zoho-oauthtoken ${accessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(leadPayload)
              });
              if (biginRes.ok) {
                structuredLogger.info({ event: "zoho_bigin_lead_created", email: normalizedEmail });
                break;
              } else {
                const errText = await biginRes.text();
                console.warn(`[Zoho Bigin] Create Contact failed at ${endpoint}:`, errText);
              }
            } catch (e) {
              console.warn(`[Zoho Bigin] Request failed for endpoint ${endpoint}:`, e.message);
            }
          }
        }
      } catch (zohoErr) {
        // Non-fatal: log and proceed so subscriber registration doesn't fail
        structuredLogger.warn({ event: "zoho_bigin_lead_failed", email: normalizedEmail, error: zohoErr.message });
      }

      // ── Send welcome email ────────────────────────────────────────────────
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailAppPass },
        });

        const { subject, html } = buildWelcomeEmail(preferences, unsubscribeToken);

        await transporter.sendMail({
          from:    `"Atlas Health Research" <${gmailUser}>`,
          to:      normalizedEmail,
          subject,
          html,
        });
      } catch (emailErr) {
        // Non-fatal: subscriber is written, email send failure is logged
        structuredLogger.warn({ event: "welcome_email_failed", email: normalizedEmail, error: emailErr.message });
      }

      structuredLogger.info({
        event: "newsletter_subscribe",
        goal:  preferences.goal || null,
        level: preferences.level || null,
      });

      return res.json({ ok: true, message: "Subscribed successfully." });

    } catch (err) {
      structuredLogger.error({ event: "newsletter_subscribe_error", error: err.message });
      return res.status(500).json({ error: "Subscription failed. Please try again." });
    }
  }
);

module.exports = handler;
