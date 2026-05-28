// src/skills/admin_os.js
// Admin OS – utilities for the admin dashboard
// -------------------------------------------------
// Responsible for building the sidebar menu, loading analytics blocks,
// and exposing generic UI helpers used throughout the admin panel.

/** Build the hierarchical menu tree used by the admin sidebar.
 * @param {Array<Object>} sections – Array of section descriptors [{id, label, icon, children}].
 * @returns {Array<Object>} menu tree ready for rendering.
 */
export function buildMenuTree(sections) {
  // Simple validation & ordering by `order` property if present
  return sections
    .filter(Boolean)
    .sort((a, b) => (a.order || 0) - (b.order || 0)
    .map(section => ({
      id: section.id,
      label: section.label,
      icon: section.icon,
      children: (section.children || []).map(c => ({
        id: c.id,
        label: c.label,
        route: c.route,
        icon: c.icon,
      })),
    }));
}

/** Load analytics blocks for the admin home.
 * @param {Object} api – An object exposing `fetchAnalytics` that returns a promise.
 * @returns {Promise<Array<Object>>} array of analytics block data.
 */
export async function loadAnalyticsBlocks(api) {
  if (!api || typeof api.fetchAnalytics !== 'function') {
    throw new Error('Admin OS: Missing fetchAnalytics method on api');
  }
  const raw = await api.fetchAnalytics();
  // Normalise shape: {title, value, trend, color}
  return raw.map(b => ({
    title: b.title ?? 'Untitled',
    value: b.value ?? 0,
    trend: b.trend ?? 'stable',
    color: b.color ?? 'var(--primary)',
  }));
}

/** Render a generic operations panel.
 * @param {Array<Object>} ops – Array of operation descriptors {label, status, icon}.
 * @returns {JSX.Element} React fragment ready for admin UI.
 */
export function renderOpsPanel(ops) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {ops.map((op, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem', background: '#fafafa',
            borderRadius: '8px', border: '1px solid var(--border)',
          }}
        >
          {op.icon}
          <span style={{ flex: 1 }}>{op.label}</span>
          <span style={{ color: op.status === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {op.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Utility to format numbers for admin display (e.g., 1.2M, 3.5K).
 * @param {number} n
 * @returns {string}
 */
export function formatMetric(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// Export a bundled object for convenience
export const adminOS = {
  buildMenuTree,
  loadAnalyticsBlocks,
  renderOpsPanel,
  formatMetric,
};
