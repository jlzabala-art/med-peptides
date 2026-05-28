 
/**
 * useHomeLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads the home-section visibility config from Firestore: config/homeLayout.
 * Falls back to DEFAULT_LAYOUT if the document doesn't exist yet.
 *
 * Shape in Firestore:
 *   config/homeLayout {
 *     guest:        Section[],
 *     professional: Section[],
 *     updatedAt:    Timestamp
 *   }
 *
 * Section shape:
 *   {
 *     id:         string,
 *     label:      string,
 *     enabled:    boolean,
 *     order:      number,
 *     visibility: 'all' | 'desktop' | 'mobile',
 *     locked?:    boolean
 *   }
 *
 * locked = true  →  admin cannot toggle OFF (always shown). Currently not used.
 *
 * Phase 2: On load, auto-syncs any registry sections missing from Firestore,
 *          adding them with their default values without overwriting existing ones.
 *          Exposes `newSectionsAdded` (boolean) so the Admin UI can show a notice.
 *
 * Phase 5: validateLayout extended with:
 *          - visibility must be 'all' | 'desktop' | 'mobile'
 *          - At least 1 enabled section visible on desktop per audience
 *          - At least 1 enabled section visible on mobile per audience
 */

import { useState, useEffect } from 'react';
import {
  doc, onSnapshot, getDoc, setDoc, serverTimestamp,
  addDoc, collection, getDocs, query, orderBy, limit, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { HOME_SECTIONS } from '../config/homeLayoutRegistry';
import { version as APP_VERSION } from '../../package.json';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_VISIBILITY = new Set(['all', 'desktop', 'mobile']);

// Cache key derived from app version (package.json).
// Bumping the version on any deploy automatically invalidates all users' caches
// so hero / layout changes are reflected immediately — no manual key bump needed.
const CACHE_KEY = `rp_homeLayout_v${APP_VERSION.replace(/\./g, '_')}`;

export const ALL_ROLES = ['admin', 'clinic', 'doctor', 'wholesaler', 'sales_agent', 'staff', 'patient', 'guest'];
export const PRO_ROLES = ['admin', 'clinic', 'doctor', 'wholesaler', 'sales_agent', 'staff'];
export const GUEST_ROLES = ['patient', 'guest'];

// ─── Cache helpers ─────────────────────────────────────────────────────────────

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Check if we have the new 8-role schema. If missing roles, bust cache to force fallback.
    let hasAll = true;
    ALL_ROLES.forEach(r => { if (!Array.isArray(parsed[r])) hasAll = false; });
    if (!hasAll) return null;

    // Apply force-overrides from the registry: if a section is now defaultEnabled: false,
    // disable it in the cached data too (prevents stale-cache flicker on first render).
    const forceDisabledIds = new Set(
      Object.values(HOME_SECTIONS)
        .filter(s => s.defaultEnabled === false)
        .map(s => s.id)
    );
    if (forceDisabledIds.size > 0) {
      const applyOverride = sections =>
        sections.map(s => forceDisabledIds.has(s.id) ? { ...s, enabled: false } : s);
      const updated = {};
      ALL_ROLES.forEach(r => { updated[r] = applyOverride(parsed[r]); });
      return updated;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCache(layout) {
  try {
    const toSave = {};
    ALL_ROLES.forEach(r => { toSave[r] = layout[r] || []; });
    localStorage.setItem(CACHE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage quota or private mode — silently ignore
  }
}

// ─── Derive defaults from the registry (single source of truth) ───────────────

function buildDefaultSections(category) {
  return Object.values(HOME_SECTIONS)
    .filter(s => s.category === category || (category === 'guest' && s.category === 'shared'))
    .map(s => ({
      id:         s.id,
      label:      s.label,
      enabled:    s.defaultEnabled ?? true,
      order:      s.defaultOrder   ?? 99,
      visibility: s.defaultVisibility ?? 'all',
    }))
    .sort((a, b) => a.order - b.order);
}

// Keep named exports for external consumers (AdminHomeLayoutTab uses them for reset)
export const DEFAULT_GUEST_SECTIONS = buildDefaultSections('guest');
export const DEFAULT_PRO_SECTIONS   = buildDefaultSections('professional');

const DEFAULT_LAYOUT = {
  admin:       DEFAULT_PRO_SECTIONS,
  clinic:      DEFAULT_PRO_SECTIONS,
  doctor:      DEFAULT_PRO_SECTIONS,
  wholesaler:  DEFAULT_PRO_SECTIONS,
  sales_agent: DEFAULT_PRO_SECTIONS,
  staff:       DEFAULT_PRO_SECTIONS,
  patient:     DEFAULT_GUEST_SECTIONS,
  guest:       DEFAULT_GUEST_SECTIONS,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHomeLayout() {
  const cached = readCache();
  const [layout, setLayout]             = useState(cached ?? DEFAULT_LAYOUT);
  const [loading, setLoading]           = useState(!cached);
  const [error, setError]               = useState(null);
  const [newSectionsAdded, setNewSectionsAdded] = useState(false); // Phase 2 notice flag
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const ref = doc(db, 'config', 'homeLayout');

    // ── Strategy: Admins use onSnapshot (real-time, needed for the admin panel).
    // ── Non-admins use getDoc (single fetch) to avoid the CORS preflight error
    //    that Firestore's WebSocket / long-poll Listen channel triggers for
    //    unauthenticated browser sessions.
    const processSnap = async (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        // ── Phase 2: auto-sync registry → Firestore ──────────────────────
        const mergedLayout = {};
        let hasMissing = false;
        const allAdded = [];

        ALL_ROLES.forEach(role => {
          // Fallback logic: If role is missing, fallback to legacy 'professional' or 'guest' keys
          let existingData = data[role];
          if (!existingData) {
            if (PRO_ROLES.includes(role)) existingData = data.professional || [];
            else existingData = data.guest || [];
          }
          const defaultSecs = PRO_ROLES.includes(role) ? DEFAULT_PRO_SECTIONS : DEFAULT_GUEST_SECTIONS;
          const { merged, added } = mergeWithDefaults(existingData, defaultSecs, role);
          mergedLayout[role] = merged;
          if (added.length > 0) {
            hasMissing = true;
            allAdded.push(...added);
          }
        });

        if (hasMissing) {
          // Persist the newly added sections without overwriting existing data
          // CRITICAL: Only admins can write to the config collection.
          if (isAdmin) {
            try {
              const toWrite = {};
              ALL_ROLES.forEach(r => { toWrite[r] = sanitize(mergedLayout[r]); });
              toWrite.updatedAt = serverTimestamp();
              toWrite.updatedBy = 'system:registry-sync';

              await setDoc(ref, toWrite);
              console.info(
                '[useHomeLayout] Auto-synced new sections →',
                allAdded.map(s => s.id),
              );
              setNewSectionsAdded(true);
            } catch (err) {
              console.error('[useHomeLayout] Auto-sync write failed:', err);
            }
          } else {
            // Silent fallback: just use the merged layout locally for guests/non-admins
            console.log('[useHomeLayout] New sections detected in registry. Local sync applied (Server sync skipped — non-admin session).');
          }
        }

        setLayout(mergedLayout);
        writeCache(mergedLayout);
      } else {
        // First run — seed the document (Admin only)
        if (isAdmin) {
          setDoc(ref, { ...DEFAULT_LAYOUT, updatedAt: serverTimestamp() }).catch(console.error);
        }
        setLayout(DEFAULT_LAYOUT);
        writeCache(DEFAULT_LAYOUT);
      }
      setLoading(false);
    };

    const handleError = (err) => {
      console.error('[useHomeLayout] Firestore error:', err);
      setError(err);
      setLoading(false);
      if (!cached) setLayout(DEFAULT_LAYOUT);
    };

    if (isAdmin) {
      // Admins: real-time listener so layout changes in the admin panel reflect instantly.
      const unsub = onSnapshot(ref, processSnap, handleError);
      return unsub;
    } else {
      // Non-admins: single one-shot read — no persistent WebSocket channel,
      // no CORS preflight errors in the browser console.
      getDoc(ref).then(processSnap).catch(handleError);
      return undefined; // no listener to unsubscribe
    }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Normalise & validate helpers ────────────────────────────────────────────

  /**
   * Re-indexes section orders to a strict 0-based contiguous sequence,
   * sorted by their current order value. Normalises entries like
   * order:99 (used for "below-the-fold" sections) before validation.
   */
  const normalizeOrders = (sections) =>
    [...sections]
      .sort((a, b) => a.order - b.order)
      .map((s, idx) => ({ ...s, order: idx }));

  /** Strip undefined values so Firestore never rejects the payload. */
  const sanitize = (data) => JSON.parse(JSON.stringify(data));

  /**
   * Validate the layout configuration before saving.
   * Orders are expected to already be normalised when this runs.
   *
   * Phase 5 additions:
   *   - visibility must be one of 'all' | 'desktop' | 'mobile'
   *   - At least 1 section enabled and visible on desktop per audience
   *   - At least 1 section enabled and visible on mobile per audience
   */
  const validateLayout = (data) => {
    const errors = { general: [] };
    ALL_ROLES.forEach(r => { errors[r] = []; });

    const validateSections = (sections, type) => {
      const ids      = new Set();
      const orders   = [];
      let   activeCount = 0;

      // Phase 5: device-visible counts
      let desktopVisible = 0;
      let mobileVisible  = 0;

      sections.forEach(s => {
        // Unique IDs
        if (ids.has(s.id)) {
          errors.general.push(`Duplicate ID found: ${s.id} in ${type} layout.`);
        }
        ids.add(s.id);

        // Required fields
        if (s.label === undefined || s.enabled === undefined) {
          errors.general.push(`Section ${s.id} in ${type} layout is missing label or enabled status.`);
        }

        // Phase 5: validate visibility value
        const vis = s.visibility ?? 'all';
        if (!VALID_VISIBILITY.has(vis)) {
          errors.general.push(
            `Section "${s.id}" in ${type} layout has invalid visibility "${vis}". Must be one of: all, desktop, mobile.`
          );
        }

        orders.push(s.order);

        if (s.enabled) {
          activeCount++;
          // Phase 5: track device availability
          if (vis !== 'mobile')  desktopVisible++;
          if (vis !== 'desktop') mobileVisible++;
        }
      });

      // Contiguous order (0, 1, 2 … n-1)
      orders.sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i) {
          errors.general.push(
            `${type.charAt(0).toUpperCase() + type.slice(1)} layout order must be a contiguous sequence starting from 0.`
          );
          break;
        }
      }

      // Phase 5: at least 1 section visible per device type
      if (desktopVisible === 0) {
        errors[type].push(
          `${type.charAt(0).toUpperCase() + type.slice(1)} layout must have at least one section enabled for desktop.`
        );
      }
      if (mobileVisible === 0) {
        errors[type].push(
          `${type.charAt(0).toUpperCase() + type.slice(1)} layout must have at least one section enabled for mobile.`
        );
      }

      return activeCount;
    };

    ALL_ROLES.forEach(role => {
      const active = validateSections(data[role], role);
      if (GUEST_ROLES.includes(role)) {
        if (active < 3) errors[role].push(`${role} layout requires at least 3 active sections.`);
        const hero = data[role].find(s => s.id === 'GuestHeroSearch');
        if (!hero?.enabled || hero?.order !== 0) {
          errors[role].push(`The 'Hero Search' must be enabled and at position 0 for ${role}.`);
        }
      } else {
        if (active < 2) errors[role].push(`${role} layout requires at least 2 active sections.`);
      }
    });

    const allErrors = [...errors.general];
    ALL_ROLES.forEach(r => allErrors.push(...errors[r]));

    return {
      isValid:          allErrors.length === 0,
      errors:           allErrors,
      structuredErrors: errors,
    };
  };

  /**
   * Persist the full layout document.
   * Before saving, snapshots the current layout into homeLayoutVersions (max 10).
   * Called by AdminHomeLayoutTab after the admin changes toggles.
   */
  const saveLayout = async (newLayout, versionLabel = '') => {
    const normalised = {};
    ALL_ROLES.forEach(r => { normalised[r] = normalizeOrders(newLayout[r]); });

    const validation = validateLayout(normalised);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }

    try {
      const docRef      = doc(db, 'config', 'homeLayout');
      const versionsRef = collection(db, 'homeLayoutVersions');

      // Version snapshot: store CURRENT layout before overwriting
      const currentSnapshot = {};
      ALL_ROLES.forEach(r => { currentSnapshot[r] = sanitize(layout[r]); });
      currentSnapshot.createdAt = serverTimestamp();
      currentSnapshot.createdBy = user?.email || 'unknown_admin';
      currentSnapshot.versionLabel = versionLabel || new Date().toLocaleString();

      await addDoc(versionsRef, currentSnapshot);

      // Prune: keep only the last 10 versions
      const countSnap = await getDocs(query(versionsRef, orderBy('createdAt', 'desc')));
      if (countSnap.size > 10) {
        const oldest = countSnap.docs[countSnap.docs.length - 1];
        await deleteDoc(oldest.ref);
      }

      // Persist normalised layout
      const toWrite = {};
      ALL_ROLES.forEach(r => { toWrite[r] = sanitize(normalised[r]); });
      toWrite.updatedAt = serverTimestamp();
      toWrite.updatedBy = user?.email || 'unknown_admin';

      await setDoc(docRef, toWrite);

      // ── Auto-purge cache when sections are hidden ─────────────────────────
      const sectionJustHidden = (oldSections, newSections) =>
        newSections.some(ns => {
          if (ns.enabled) return false;
          const os = oldSections.find(s => s.id === ns.id);
          return os?.enabled === true; // was enabled, now disabled
        });

      let anySectionHidden = false;
      ALL_ROLES.forEach(r => {
        if (sectionJustHidden(layout[r], normalised[r])) anySectionHidden = true;
      });

      if (anySectionHidden) {
        try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
        console.info('[useHomeLayout] Section(s) hidden → cache cleared.');
      }

      // Clear the "new sections synced" notice after the admin saves manually
      setNewSectionsAdded(false);
      setLayout(normalised);
      writeCache(normalised); // write fresh, already-clean layout
    } catch (err) {
      console.error('Error saving home layout:', err);
      throw err;
    }
  };

  return { layout, loading, error, saveLayout, newSectionsAdded };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Merge saved Firestore sections with the registry defaults.
 *
 * Priority rules:
 * - Metadata fields (label, description, locked) always come from the
 *   registry — the single source of truth. This keeps labels in sync even
 *   after registry updates without a manual Firestore reset.
 * - User-controlled fields (enabled, order, visibility) are preserved from
 *   Firestore so that admin choices are not overwritten on every load.
 * - Sections present in the registry but missing from Firestore are added
 *   with all registry defaults.
 * - `visibility` is normalised to 'all' when the stored value is invalid.
 *
 * Returns { merged: Section[], added: Section[] } where `added` lists
 * any brand-new sections injected from the registry (Phase 2 notice).
 */
function mergeWithDefaults(saved, defaults) {
  const savedMap = Object.fromEntries(saved.map(s => [s.id, s]));
  const added    = [];

  const merged = defaults.map(def => {
    const existing = savedMap[def.id];
    if (existing) {
      return {
        // Start with user-controlled Firestore state
        ...existing,
        // Always override metadata from the registry (single source of truth)
        id:          def.id,
        label:       def.label,
        description: def.description,
        // Guarantee visibility is always a valid value for existing records
        visibility: VALID_VISIBILITY.has(existing.visibility) ? existing.visibility : 'all',
        locked:     def.locked, // locked is code-only
        // FORCE-OVERRIDE: if the registry explicitly disables a section (defaultEnabled: false),
        // it always wins over whatever is persisted in Firestore. This allows devs to hard-disable
        // sections like ClinicalAIPromo without needing manual Firestore cleanup.
        ...(def.enabled === false ? { enabled: false } : {}),
      };
    }
    // Brand-new section: use registry defaults
    const newEntry = {
      id:         def.id,
      label:      def.label,
      enabled:    def.enabled,
      order:      def.order,
      visibility: def.visibility ?? 'all',
    };
    added.push(newEntry);
    return newEntry;
  });

  return {
    merged: merged.sort((a, b) => a.order - b.order),
    added,
  };
}

// ─── Version History Hook ─────────────────────────────────────────────────────

/**
 * useLayoutHistory
 * Fetches the last N snapshots from homeLayoutVersions.
 * Returns { versions, loading, fetchVersions, restoreVersion }.
 */
export function useLayoutHistory(saveLayout) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading]   = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const versionsRef = collection(db, 'homeLayoutVersions');
      const snap = await getDocs(
        query(versionsRef, orderBy('createdAt', 'desc'), limit(10))
      );
      setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[useLayoutHistory] fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (version) => {
    const layoutToRestore = {};
    ALL_ROLES.forEach(r => { 
      // Handle legacy versions that only had guest/professional
      if (version[r]) {
        layoutToRestore[r] = version[r];
      } else {
        layoutToRestore[r] = PRO_ROLES.includes(r) ? (version.professional || []) : (version.guest || []);
      }
    });

    await saveLayout(
      layoutToRestore,
      `Restored from: ${version.versionLabel}`
    );
    await fetchVersions();
  };

  return { versions, loading, fetchVersions, restoreVersion };
}
