/**
 * Utility for triggering haptic feedback on mobile devices.
 * Supports different patterns based on vibration API.
 */
export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return; // Haptics not supported or disabled
  }

  try {
    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(30);
        break;
      case 'success':
        window.navigator.vibrate([10, 30, 20]);
        break;
      case 'error':
        window.navigator.vibrate([20, 40, 20, 40, 30]);
        break;
      default:
        window.navigator.vibrate(15);
    }
  } catch (error) {
    // Ignore errors for permissions/hardware absence
    console.warn('Haptics failed', error);
  }
};
