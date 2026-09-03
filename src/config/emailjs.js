/**
 * emailjs.js — Centralized EmailJS Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for EmailJS service IDs, template IDs, and keys.
 * Backed by NEXT_PUBLIC_ environment variables with fallback constants.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const EMAILJS_CONFIG = Object.freeze({
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_default',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  TEMPLATES: {
    STANDARD_INVITATION: process.env.NEXT_PUBLIC_EMAILJS_INVITE_TEMPLATE || 'template_7unfks8',
    ORDER_CONFIRMATION: process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE || 'template_7unfks8',
    USER_WELCOME: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE || 'template_7unfks8',
    GENERAL_NOTIFICATION: process.env.NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE || 'template_7unfks8',
  }
});
