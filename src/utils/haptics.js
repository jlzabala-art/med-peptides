/**
 * Haptic Feedback & Touch Micro-Interactions Utility
 * Uses navigator.vibrate where available with silent graceful fallback.
 */

export function triggerHaptic(type = 'light') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'tap':
        navigator.vibrate(10); // 10ms subtle tick
        break;
      case 'medium':
      case 'select':
        navigator.vibrate(20); // 20ms click feel
        break;
      case 'success':
      case 'copy':
        navigator.vibrate([15, 40, 15]); // double pulse
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      case 'error':
        navigator.vibrate([50, 60, 50, 60, 50]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Non-critical, ignore if permissions/device do not support
  }
}
