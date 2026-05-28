 
import { useEffect, useRef, useMemo } from 'react';

/**
 * MoleculeParticles
 * ─────────────────
 * Renders a subtle, GPU-friendly animated molecular particle field using a
 * <canvas> element. Designed for the Home page background.
 *
 * Performance contract:
 * - Uses requestAnimationFrame with a 30fps cap (every other frame)
 * - Maximum 40 particles (20 on mobile < 768px)
 * - Fully paused when tab is hidden (visibilitychange)
 * - Automatically disabled when prefers-reduced-motion is set
 * - Canvas is pointer-events:none so it never blocks interactions
 */

const CONFIG = {
  PARTICLE_COUNT_DESKTOP: 36,
  PARTICLE_COUNT_MOBILE:  18,
  SPEED_MAX:  0.22,
  SPEED_MIN:  0.06,
  RADIUS_MAX: 2.2,
  RADIUS_MIN: 0.7,
  BOND_DIST:  140,       // max px distance to draw a bond line
  COLOR_HUE:  200,       // matches --primary hue (clinical blue)
  ALPHA_NODE: 0.38,
  ALPHA_BOND: 0.10,
  FPS_CAP:    30,
};

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createParticles(count, w, h) {
  return Array.from({ length: count }, () => ({
    x:  Math.random() * w,
    y:  Math.random() * h,
    vx: randomBetween(-CONFIG.SPEED_MAX, CONFIG.SPEED_MAX),
    vy: randomBetween(-CONFIG.SPEED_MAX, CONFIG.SPEED_MAX),
    r:  randomBetween(CONFIG.RADIUS_MIN, CONFIG.RADIUS_MAX),
  }));
}

export default function MoleculeParticles({ style }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    particles: [],
    raf: null,
    lastTime: 0,
    paused: false,
    mouseX: null,
    mouseY: null,
  });

  // Detect reduced-motion once
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) return; // honour OS preference — render nothing

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    const state  = stateRef.current;
    const isMob  = window.innerWidth < 768;
    const count  = isMob ? CONFIG.PARTICLE_COUNT_MOBILE : CONFIG.PARTICLE_COUNT_DESKTOP;

    function resize() {
      const parent = canvas.parentElement;
      canvas.width  = parent ? parent.offsetWidth  : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      state.particles = createParticles(count, canvas.width, canvas.height);
    }

    resize();

    function draw(ts) {
      if (state.paused) {
        state.raf = requestAnimationFrame(draw);
        return;
      }

      // 30 fps cap
      const elapsed = ts - state.lastTime;
      if (elapsed < 1000 / CONFIG.FPS_CAP) {
        state.raf = requestAnimationFrame(draw);
        return;
      }
      state.lastTime = ts;

      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      const pts = state.particles;
      const mX = state.mouseX;
      const mY = state.mouseY;

      // Draw bonds first (under nodes)
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        // Draw bonds between nodes
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.BOND_DIST) {
            const alpha = CONFIG.ALPHA_BOND * (1 - dist / CONFIG.BOND_DIST);
            ctx.strokeStyle = `hsla(${CONFIG.COLOR_HUE}, 80%, 65%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }

        // Draw bond to mouse cursor if close
        if (mX !== null && mY !== null) {
          const dx = pts[i].x - mX;
          const dy = pts[i].y - mY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxMouseDist = 180;
          if (dist < maxMouseDist) {
            const alpha = 0.18 * (1 - dist / maxMouseDist);
            ctx.strokeStyle = `hsla(${CONFIG.COLOR_HUE}, 90%, 70%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(mX, mY);
            ctx.stroke();

            // Gentle push away from cursor
            const force = (maxMouseDist - dist) / maxMouseDist;
            const angle = Math.atan2(dy, dx);
            pts[i].x += Math.cos(angle) * force * 1.5;
            pts[i].y += Math.sin(angle) * force * 1.5;
          }
        }
      }

      // Draw nodes
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${CONFIG.COLOR_HUE}, 80%, 75%, ${CONFIG.ALPHA_NODE})`;
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Soft wrap (re-enter from opposite edge)
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      state.raf = requestAnimationFrame(draw);
    }

    state.raf = requestAnimationFrame(draw);

    // Track mouse coordinates globally on window
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left;
      state.mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      state.mouseX = null;
      state.mouseY = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Pause on hidden tab
    const handleVisibility = () => {
      state.paused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Debounced resize
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        0,
        ...style,
      }}
    />
  );
}
