import * as React from 'react';

/**
 * Minimal helpers for using the browser View Transitions API (when available)
 * and React's experimental <ViewTransition> wrapper (when available).
 *
 * Notes:
 * - The View Transitions API is currently only supported in some browsers.
 * - React's experimental <ViewTransition> component exists in canary builds;
 *   it may not be present in stable TypeScript types. This file keeps usage
 *   type-safe by treating it as an optional component.
 */

type StartViewTransitionFn = (callback: () => void | Promise<void>) => {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
};

/**
 * Returns true if the runtime supports `document.startViewTransition`.
 */
export const supportsViewTransitions = (): boolean => {
  if (typeof document === 'undefined') return false;
  return (
    typeof (document as unknown as { startViewTransition?: unknown })
      .startViewTransition === 'function'
  );
};

/**
 * Run a synchronous DOM/state update inside a view transition if supported.
 * Falls back to running the callback immediately.
 */
export const withViewTransition = (update: () => void): void => {
  if (!supportsViewTransitions()) {
    update();
    return;
  }

  const start = (
    document as unknown as { startViewTransition: StartViewTransitionFn }
  ).startViewTransition;

  // The callback should perform DOM-affecting updates synchronously.
  start(() => {
    update();
  });
};

/**
 * Run an async workflow inside a view transition if supported.
 *
 * IMPORTANT: The View Transitions API expects DOM updates to happen in the callback.
 * For async work, do your optimistic update synchronously first, then await after.
 *
 * Example:
 *   await withViewTransitionAsync(async () => {
 *     setOptimistic(...)
 *     await mutateAsync(...)
 *   })
 */
export const withViewTransitionAsync = async (
  update: () => void | Promise<void>,
): Promise<void> => {
  if (!supportsViewTransitions()) {
    await update();
    return;
  }

  const start = (
    document as unknown as { startViewTransition: StartViewTransitionFn }
  ).startViewTransition;

  const transition = start(async () => {
    await update();
  });

  // Ensure callers can await the "visual" completion.
  await transition.finished;
};

/**
 * Attempts to load React's experimental <ViewTransition> component if present.
 * In React canary builds this should exist, but TypeScript types may not include it.
 */
const getReactViewTransitionComponent = (): React.ComponentType<
  React.PropsWithChildren<{ name?: string; className?: string }>
> | null => {
  const anyReact = React as unknown as {
    ViewTransition?: React.ComponentType<
      React.PropsWithChildren<{ name?: string; className?: string }>
    >;
  };

  return typeof anyReact.ViewTransition === 'function'
    ? anyReact.ViewTransition
    : null;
};

export interface ViewTransitionProps extends React.PropsWithChildren {
  /**
   * Optional name for the view transition group; maps to `view-transition-name`.
   * If you pass a name, consider adding CSS with `view-transition-name: <name>`.
   */
  name?: string;

  /**
   * Optional className applied to the wrapper.
   *
   * When React's experimental <ViewTransition> is available, the className is
   * passed through to it; otherwise a <div> is used.
   */
  className?: string;

  /**
   * Wrapper element to use when <ViewTransition> isn't available.
   * Defaults to 'div'.
   *
   * Note: using React.ElementType avoids relying on the global JSX namespace
   * (which may not be available depending on TS JSX settings).
   */
  as?: React.ElementType;
}

/**
 * React wrapper that uses the experimental <ViewTransition> component when available,
 * otherwise renders a normal element as a graceful fallback.
 */
export const ViewTransition = ({
  children,
  name,
  className,
  as = 'div',
}: ViewTransitionProps) => {
  const Experimental = getReactViewTransitionComponent();

  if (Experimental) {
    return (
      <Experimental name={name} className={className}>
        {children}
      </Experimental>
    );
  }

  const FallbackTag = as;

  // When not using experimental wrapper, you can still get view transitions
  // by triggering state updates inside `document.startViewTransition(...)`.
  // `name` is not applied here because it's meaningful only to the wrapper/CSS.
  return <FallbackTag className={className}>{children}</FallbackTag>;
};
