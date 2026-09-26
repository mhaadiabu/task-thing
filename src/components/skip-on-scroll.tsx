import { useEffect } from 'react';

const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

// Animation snapshots are pinned to the screen, not the page. If the user
// scrolls mid-animation, finish it so content never drifts with the scroll.
// Listens to user input, not the scroll event, so a scroll the browser makes
// on its own (layout shift, momentum settle) doesn't cut an animation short.
export function SkipOnScroll() {
  useEffect(() => {
    const skip = () => document.activeViewTransition?.skipTransition();
    const onKey = (e: KeyboardEvent) => scrollKeys.has(e.key) && skip();
    // Capture catches input over any scroll area: the page and inner ones.
    const options = { capture: true, passive: true } as const;
    addEventListener('wheel', skip, options);
    addEventListener('touchmove', skip, options);
    addEventListener('keydown', onKey, options);
    return () => {
      removeEventListener('wheel', skip, options);
      removeEventListener('touchmove', skip, options);
      removeEventListener('keydown', onKey, options);
    };
  }, []);
  return null;
}
