import { useCallback, useRef } from 'react';

interface UseViewTransition {
  startViewTransition: (callback: () => void | Promise<void>) => void;
  supported: boolean;
}

export function useViewTransition(): UseViewTransition {
  const isTransitioning = useRef(false);

  const startViewTransition = useCallback((callback: () => void | Promise<void>) => {
    if (typeof document === 'undefined' || !('startViewTransition' in document)) {
      callback();
      return;
    }

    if (isTransitioning.current) {
      return;
    }

    isTransitioning.current = true;

    const transition = (document as Document & { startViewTransition: (callback: () => void | Promise<void>) => ViewTransition }).startViewTransition(async () => {
      await callback();
    });

    transition.finished.finally(() => {
      isTransitioning.current = false;
    });
  }, []);

  return {
    startViewTransition,
    supported: typeof document !== 'undefined' && 'startViewTransition' in document,
  };
}

// Polyfill for ViewTransition type
type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
};
