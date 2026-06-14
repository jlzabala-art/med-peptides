import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }
      setIsAtTop(scrollY < 50);
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    
    // Also attach to #main-scroll-container if it exists (for layouts with overflow)
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', () => {
        const scrollY = mainContainer.scrollTop;
        const direction = scrollY > lastScrollY ? 'down' : 'up';
        if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
          setScrollDirection(direction);
        }
        setIsAtTop(scrollY < 50);
        lastScrollY = scrollY > 0 ? scrollY : 0;
      }, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
      if (mainContainer) mainContainer.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  return { scrollDirection, isAtTop };
}
