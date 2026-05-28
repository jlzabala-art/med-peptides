 import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const GA_ID = 'G-LYMXGY71FJ';

export async function logPageViewToFirestore(path, title) {
  try {
    const user = auth?.currentUser;
    const uid = user ? user.uid : 'anonymous';
    
    const locale = typeof navigator !== 'undefined' ? (navigator.language || 'unknown') : 'unknown';
    let detectedCountry = 'AE';
    if (locale && locale.includes('-')) {
      const parts = locale.split('-');
      if (parts[1]) detectedCountry = parts[1].toUpperCase();
    }
    
    const countryMap = {
      'AE': 'United Arab Emirates',
      'ES': 'Spain',
      'US': 'United States',
      'GB': 'United Kingdom',
      'FR': 'France',
      'DE': 'Germany',
      'IT': 'Italy',
      'RU': 'Russia',
      'CN': 'China',
      'JP': 'Japan',
      'SA': 'Saudi Arabia',
      'OM': 'Oman',
      'QA': 'Qatar',
      'BH': 'Bahrain',
      'KW': 'Kuwait'
    };
    const countryName = countryMap[detectedCountry] || detectedCountry;
    
    const cleanedPath = path.split('?')[0];
    
    await addDoc(collection(db, 'page_views'), {
      pagePath: cleanedPath || '/',
      pageTitle: title || 'Page',
      userId: uid,
      country: countryName,
      timestamp: new Date().toISOString(),
      serverTime: serverTimestamp()
    });
  } catch (err) {
    console.warn('[Analytics] Failed to log page view to Firestore:', err);
  }
}

/** Fire a page_view event — call this on every SPA route change */
export function trackPageView(path, title) {
  logPageViewToFirestore(path, title);

  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path:     path,
    page_title:    title,
    page_location: window.location.href,
    send_to:       GA_ID,
  });
}

/**
 * Fire a custom GA4 event.
 * @param {string} eventName  - GA4 event name (snake_case)
 * @param {object} [params]   - Optional event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, { send_to: GA_ID, ...params });
}

/**
 * Detect user country from browser locale and fire user_location_detected event.
 */
export function trackLocation() {
  if (typeof window.gtag !== 'function') return;
  const locale = navigator.language || (navigator.languages && navigator.languages[0]) || 'unknown';
  // Attempt to extract country code from 'en-US' or 'es-ES' format
  const country = locale.includes('-') ? locale.split('-')[1].toUpperCase() : locale.toUpperCase();
  
  trackEvent('user_location_detected', { country });
}

/**
 * Track 404 errors.
 */
export function track404(path) {
  trackEvent('404_error', {
    page_path: path || window.location.pathname,
    page_location: window.location.href
  });
}

/**
 * Track internal site search.
 */
export function trackSearch(query, resultsCount) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount
  });
}

/**
 * Track form interactions.
 * @param {string} formName - Unique name of the form
 * @param {'start'|'submit'|'success'|'error'} action - Form action
 * @param {object} [details] - Additional context
 */
export function trackFormEngagement(formName, action, details = {}) {
  trackEvent(`form_${action}`, {
    form_name: formName,
    ...details
  });
}

/**
 * Track file downloads (e.g. PDF protocols).
 */
export function trackFileDownload(fileName, fileExtension, details = {}) {
  trackEvent('file_download', {
    file_name: fileName,
    file_extension: fileExtension,
    ...details
  });
}

/**
 * Set User ID for cross-device tracking in GA4.
 * @param {string|null} userId - The unique identifier for the user (e.g. Firebase UID).
 */
export function setAnalyticsUserId(userId) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('config', GA_ID, { 'user_id': userId });
}

/**
 * Set User Properties in GA4.
 * @param {object} properties - Key-value pairs of user properties.
 */
export function setUserProperties(properties) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('set', 'user_properties', properties);
}

/**
 * Track usage of specific scientific tools.
 * @param {string} toolName - Name of the tool (e.g. 'peptide_calculator', 'protocol_finder').
 * @param {object} [details] - Additional contextual data.
 */
export function trackToolUsage(toolName, details = {}) {
  trackEvent('tool_engagement', {
    tool_name: toolName,
    ...details
  });
}

/**
 * Track purchase intent (conversions).
 * @param {object} details - Product/Protocol details.
 */
export function trackPurchaseIntent(details) {
  trackEvent('purchase_intent', details);
}

/**
 * Track when a peptide is viewed in detail or list.
 * @param {object} details - Product details.
 */
export function trackPeptideView(details) {
  trackEvent('peptide_view', details);
}

// ── Trending section events ───────────────────────────────────────────────────

/**
 * Track a protocol card click in the TrendingProtocols section.
 * @param {{ item_id: string, item_title: string, category: string, position: number, device_type: 'mobile'|'desktop' }} details
 */
export function trackProtocolClick(details) {
  trackEvent('trending_protocol_click', details);
}

/**
 * Track a peptide card click in the TrendingPeptides section.
 * @param {{ item_id: string, item_title: string, category: string, position: number, device_type: 'mobile'|'desktop' }} details
 */
export function trackPeptideClick(details) {
  trackEvent('trending_peptide_click', details);
}

/**
 * Track when a category accordion is opened/closed in a trending section.
 * @param {{ section: 'protocols'|'peptides', category: string, action: 'open'|'close', device_type: 'mobile'|'desktop' }} details
 */
export function trackTrendingCategoryOpen(details) {
  trackEvent('trending_category_toggle', details);
}

/**
 * Set the user's role as a GA4 user property so reports can segment by
 * guest / professional / admin.
 * Call this whenever auth state changes (login, logout, register).
 *
 * @param {'guest'|'professional'|'admin'} role
 * @param {string|null} userId - Firebase UID (null when logged out)
 */
export function setAnalyticsUserRole(role, userId = null) {
  if (typeof window.gtag !== 'function') return;
  // Set the user_id for cross-device tracking
  if (userId) {
    window.gtag('config', GA_ID, { user_id: userId });
  }
  // Set user property — visible in GA4 Explorer and Audiences
  window.gtag('set', 'user_properties', {
    user_role: role,          // 'guest' | 'professional' | 'admin'
    is_authenticated: userId ? 'true' : 'false',
  });
}

/**
 * useAnalytics — convenience hook that returns all tracking helpers.
 * Usage: `const { trackEvent, trackPeptideView, … } = useAnalytics();`
 */
export function useAnalytics() {
  return {
    trackPageView,
    trackEvent,
    trackLocation,
    track404,
    trackSearch,
    trackFormEngagement,
    trackFileDownload,
    setAnalyticsUserId,
    setUserProperties,
    trackToolUsage,
    trackPurchaseIntent,
    trackPeptideView,
    trackProtocolClick,
    trackPeptideClick,
    trackTrendingCategoryOpen,
    setAnalyticsUserRole,
  };
}
