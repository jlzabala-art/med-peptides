import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { triggerHaptic } from '../../utils/haptics';

export default function PullToRefreshWrapper({ children, onRefresh }) {
  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const controls = useAnimation();

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = async (e) => {
    if (window.scrollY === 0 && startY > 0 && !refreshing) {
      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 0 && pullDistance < 150) {
        controls.set({ y: pullDistance * 0.4 });
      }

      if (pullDistance > 120 && !refreshing) {
        setRefreshing(true);
        triggerHaptic('success');
        controls.start({ y: 50, transition: { type: 'spring' } });
        await onRefresh();
        setRefreshing(false);
        controls.start({ y: 0 });
      }
    }
  };

  const handleTouchEnd = () => {
    if (!refreshing) {
      controls.start({ y: 0 });
    }
    setStartY(0);
  };

  return (
    <div 
      style={{ overflow: 'hidden', position: 'relative' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div animate={controls}>
        {refreshing && (
          <div style={{ position: 'absolute', top: '-40px', width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}>↻</span>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
