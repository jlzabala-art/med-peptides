/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageTransition
 * Wraps route content with a subtle fade + 8px vertical slide.
 * - Duration: 250ms (imperceptible on fast routes, satisfying on slow ones)
 * - Respects prefers-reduced-motion: reduces to pure opacity-only fade
 * - Usage: wrap each <Route element={...}> content, or wrap <Routes> output
 */

const VARIANTS = {
  initial:  { opacity: 0, y: 12, scale: 0.98, filter: 'blur(4px)' },
  animate:  { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit:     { opacity: 0, y: -12, scale: 0.98, filter: 'blur(4px)' },
};

const VARIANTS_REDUCED = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
};

const TRANSITION = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1], // Material Design standard easing
};

const TRANSITION_REDUCED = {
  duration: 0.15,
  ease: 'easeInOut',
};

export default function PageTransition({ children, locationKey }) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locationKey}
        variants={prefersReduced ? VARIANTS_REDUCED : VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={prefersReduced ? TRANSITION_REDUCED : TRANSITION}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
