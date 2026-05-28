 
/**
 * analytics.js
 * Centralised GA4 event helpers for Med-Peptides.
 *
 * Uses window.gtag loaded by the inline script in index.html.
 * All calls are no-ops when gtag is not present (e.g. tests, ad-blockers).
 */

const GA_ID = 'G-LYMXGY71FJ';

/** Safe wrapper — never throws even if gtag is blocked */
function gtag(...args) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

/** Lightweight device type derived from viewport width */
function getDeviceType() {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

// ─── Peptide section events ───────────────────────────────────────────────────

/**
 * Fired when a user clicks on a peptide card to view its detail page.
 * @param {string} peptideName  - Display name of the peptide
 * @param {string} peptideSlug  - URL slug / id
 * @param {string} category     - Peptide category
 */
export function trackPeptideView(peptideName, peptideSlug, category = '') {
  gtag('event', 'peptide_view', {
    send_to:      GA_ID,
    peptide_name: peptideName,
    peptide_slug: peptideSlug,
    category,
    device_type:  getDeviceType(),
  });
}

/**
 * Fired when a peptide accordion item is expanded (mobile).
 * @param {string} peptideName
 * @param {string} peptideSlug
 */
export function trackPeptideExpand(peptideName, peptideSlug) {
  gtag('event', 'peptide_expand', {
    send_to:      GA_ID,
    peptide_name: peptideName,
    peptide_slug: peptideSlug,
    device_type:  getDeviceType(),
  });
}

/**
 * Fired when the user types a search query (debounced at call site).
 * @param {string} query - Raw search string entered by the user
 */
export function trackPeptideSearch(query) {
  if (!query || query.trim().length < 2) return;
  gtag('event', 'peptide_search', {
    send_to:      GA_ID,
    search_term:  query.trim().toLowerCase(),
    device_type:  getDeviceType(),
  });
}

/**
 * Fired when the user clicks "Load 4 More" or changes page.
 * @param {number} page        - New page index (0-based)
 * @param {string} filter      - Active category filter
 * @param {string} context     - 'desktop' | 'mobile_accordion'
 */
export function trackPeptideLoadMore(page, filter = 'All', context = 'desktop') {
  gtag('event', 'peptide_load_more', {
    send_to:     GA_ID,
    page_index:  page,
    filter,
    context,
    device_type: getDeviceType(),
  });
}

/**
 * Fired when the user switches category filter.
 * @param {string} filter
 */
export function trackPeptideFilterChange(filter) {
  gtag('event', 'peptide_filter_change', {
    send_to:     GA_ID,
    filter,
    device_type: getDeviceType(),
  });
}

// ─── Protocol section events ──────────────────────────────────────────────────

/**
 * Fired when a user clicks on a protocol card to view its detail page.
 * @param {string} protocolTitle - Display title of the protocol
 * @param {string} protocolId    - Protocol ID / slug
 * @param {string} category      - Protocol category
 * @param {string} source        - 'most_used' | 'filtered' | 'search'
 */
export function trackProtocolView(protocolTitle, protocolId, category = '', source = 'filtered') {
  gtag('event', 'protocol_view', {
    send_to:        GA_ID,
    protocol_title: protocolTitle,
    protocol_id:    protocolId,
    category,
    source,
    device_type:    getDeviceType(),
  });
}

/**
 * Fired when a user clicks a card in the "Most Used Protocols" strip.
 * @param {string} protocolTitle
 * @param {string} protocolId
 * @param {number} position  - 0-indexed position in the strip
 */
export function trackProtocolMostUsedClick(protocolTitle, protocolId, position) {
  gtag('event', 'protocol_most_used_click', {
    send_to:        GA_ID,
    protocol_title: protocolTitle,
    protocol_id:    protocolId,
    position,
    device_type:    getDeviceType(),
  });
}

/**
 * Fired when the user navigates pages in the protocol grid.
 * @param {number} page     - New page index (0-based)
 * @param {string} filter   - Active category filter
 * @param {string} direction - 'next' | 'previous'
 */
export function trackProtocolLoadMore(page, filter = 'All', direction = 'next') {
  gtag('event', 'protocol_load_more', {
    send_to:    GA_ID,
    page_index: page,
    filter,
    direction,
    device_type: getDeviceType(),
  });
}

/**
 * Fired when the user switches the category filter in the protocols sidebar.
 * @param {string} filter
 */
export function trackProtocolFilterChange(filter) {
  gtag('event', 'protocol_filter_change', {
    send_to:     GA_ID,
    filter,
    device_type: getDeviceType(),
  });
}

// ─── Key Peptides section events ──────────────────────────────────────────────

/**
 * Fired once after the "Most Used Peptides" strip loads (non-empty).
 * @param {number} count - How many most-used cards are shown (usually 4)
 */
export function trackKeyPeptideMostUsedView(count) {
  gtag('event', 'key_peptide_most_used_view', {
    send_to:     GA_ID,
    count,
    device_type: getDeviceType(),
  });
}

/**
 * Fired when the user clicks a card in the "Most Used Peptides" strip.
 * @param {string} peptideName
 * @param {string} peptideSlug
 * @param {number} position - 0-indexed position in the strip
 */
export function trackKeyPeptideMostUsedClick(peptideName, peptideSlug, position) {
  gtag('event', 'key_peptide_most_used_click', {
    send_to:      GA_ID,
    peptide_name: peptideName,
    peptide_slug: peptideSlug,
    position,
    device_type:  getDeviceType(),
  });
}

/**
 * Fired when the user clicks a category chip in the Key Peptides filter bar.
 * @param {string} category         - Newly selected category
 * @param {string} previousCategory - Previously active category
 */
export function trackKeyPeptideCategoryFilter(category, previousCategory = '') {
  gtag('event', 'key_peptide_category_filter', {
    send_to:           GA_ID,
    category,
    previous_category: previousCategory,
    device_type:       getDeviceType(),
  });
}

/**
 * Fired when the user clicks any peptide card in the category results grid.
 * @param {string} peptideName
 * @param {string} peptideSlug
 * @param {string} category
 * @param {string} source - 'most_used' | 'filtered'
 */
export function trackKeyPeptideCardClick(peptideName, peptideSlug, category = '', source = 'filtered') {
  gtag('event', 'key_peptide_card_click', {
    send_to:      GA_ID,
    peptide_name: peptideName,
    peptide_slug: peptideSlug,
    category,
    source,
    device_type:  getDeviceType(),
  });
}

// ─── ClinicalAI Intelligence events (Phase 5) ─────────────────────────────────

/**
 * Fired when the user opens the ClinicalAI assistant for the first time in a
 * browser session (session_start guard applied at call-site).
 * @param {string} sessionId  - Unique session identifier stored in sessionStorage
 * @param {string} sourcePage - pathname where the assistant was opened
 */
export function trackAISessionStart(sessionId, sourcePage = '') {
  gtag('event', 'ai_session_start', {
    send_to:     GA_ID,
    session_id:  sessionId,
    source_page: sourcePage,
    device_type: getDeviceType(),
  });
}

/**
 * Fired every time the user sends a message to ClinicalAI.
 * @param {string} sessionId   - Session identifier
 * @param {number} questionIndex - 0-indexed position of this message in the session
 * @param {string} intent      - Inferred intent theme ('recovery & repair', etc.) or 'unknown'
 * @param {boolean} isComparison - Whether the message is a compound comparison query
 */
export function trackAIQuestion(sessionId, questionIndex = 0, intent = 'unknown', isComparison = false) {
  gtag('event', 'ai_question', {
    send_to:        GA_ID,
    session_id:     sessionId,
    question_index: questionIndex,
    intent_theme:   intent,
    is_comparison:  isComparison,
    device_type:    getDeviceType(),
  });
}

/**
 * Fired when the user submits thumbs-up or thumbs-down feedback on an AI response.
 * @param {string} sessionId    - Session identifier
 * @param {number} messageIndex - Index of the rated message in the thread
 * @param {'up'|'down'} rating  - Thumbs direction
 */
export function trackAIFeedback(sessionId, messageIndex = 0, rating = 'up') {
  gtag('event', 'ai_feedback', {
    send_to:       GA_ID,
    session_id:    sessionId,
    message_index: messageIndex,
    rating,
    device_type:   getDeviceType(),
  });
}

/**
 * Fired when the user clicks the WhatsApp escalation CTA inside ClinicalAI.
 * @param {string} sessionId  - Session identifier
 * @param {string} triggerType - The reason the card appeared ('negative_feedback', 'long_engagement', etc.)
 * @param {number} messagesCount - How many messages were sent before escalating
 */
export function trackAIToWhatsApp(sessionId, triggerType = 'manual', messagesCount = 0) {
  gtag('event', 'ai_to_whatsapp', {
    send_to:        GA_ID,
    session_id:     sessionId,
    trigger_type:   triggerType,
    messages_count: messagesCount,
    device_type:    getDeviceType(),
  });
}

// ─── Friction Tracking events (Phase 6) ───────────────────────────────────────

/**
 * Fired when the user's search query returns zero results across all tabs.
 * Helps identify content gaps or confusing terminology.
 * @param {string} query       - The exact search term entered
 * @param {string} activeTab   - Which tab was active when zero results appeared
 */
export function trackSearchEmptyResult(query, activeTab = 'peptides') {
  if (!query || query.trim().length < 2) return;
  gtag('event', 'search_empty_result', {
    send_to:     GA_ID,
    search_term: query.trim().toLowerCase(),
    active_tab:  activeTab,
    device_type: getDeviceType(),
  });
}

/**
 * Fired when the user submits the same search term more than once in a session.
 * Signals confusion, unmet expectations, or filtering frustration.
 * @param {string} query        - The repeated search term
 * @param {number} repeatCount  - How many times it has been repeated
 */
export function trackSearchRepeated(query, repeatCount = 2) {
  if (!query || query.trim().length < 2) return;
  gtag('event', 'search_repeated', {
    send_to:      GA_ID,
    search_term:  query.trim().toLowerCase(),
    repeat_count: repeatCount,
    device_type:  getDeviceType(),
  });
}

/**
 * Fired when a blog post is viewed.
 * @param {string} slug - The blog post slug identifier.
 */
export function trackBlogView(slug) {
  if (!slug) return;
  gtag('event', 'blog_view', {
    send_to: GA_ID,
    blog_slug: slug,
    device_type: getDeviceType(),
  });
}
