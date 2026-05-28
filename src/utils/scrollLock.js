 
/**
 * scrollLock.js — v3
 * 
 * KEY FIX: We no longer set touchAction:'none' on document.body.
 * 
 * Reason: On iOS Safari, setting touchAction on the body document-level
 * PERMANENTLY disables all touch-based scrolling for the entire page, even
 * after the property is removed, in some edge cases (Strict Mode double-invoke,
 * fast unmount before cleanup, or async render). The fixed modals (Cart, SearchModal)
 * visually cover the content anyway, so overflow:hidden on the body is sufficient
 * to prevent desktop background scroll without breaking mobile.
 * 
 * overflow:hidden on body still works correctly to prevent keyboard/mouse scroll
 * on desktop but is safe on mobile.
 */

const _activeLocks = new Set();
let _lockIdCounter = 0;

function _applyLock() {
  if (typeof document === 'undefined' || !document.body) return;
  document.body.style.overflow = 'hidden';
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollBarWidth > 0) {
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }
}

function _applyUnlock() {
  if (typeof document === 'undefined' || !document.body) return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Lock scroll. Returns a token that must be passed to unlockScroll().
 */
export function lockScroll() {
  const id = ++_lockIdCounter;
  _activeLocks.add(id);
  if (_activeLocks.size === 1) {
    _applyLock();
  }
  return id;
}

/**
 * Unlock scroll using the token returned by lockScroll().
 */
export function unlockScroll(id) {
  if (id !== undefined) {
    _activeLocks.delete(id);
  } else {
    // Legacy: if no id, remove one arbitrary lock (backwards compatible)
    const first = _activeLocks.values().next().value;
    if (first !== undefined) _activeLocks.delete(first);
  }
  if (_activeLocks.size === 0) {
    _applyUnlock();
  }
}

/**
 * Nuclear option: clear ALL scroll locks and restore scroll immediately.
 * Called on every route change to guarantee a clean state.
 * Also clears touchAction in case older deployments left it set.
 */
export function clearScrollLocks() {
  _activeLocks.clear();
  _applyUnlock();
  // Extra safety: clean up any touchAction left by older versions of this module
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.touchAction = '';
  }
}

export const getLockCount = () => _activeLocks.size;
