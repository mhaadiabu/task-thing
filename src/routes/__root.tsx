import type { QueryClient } from '@tanstack/react-query';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { SkipOnScroll } from '@/components/skip-on-scroll';
import TaskProvider from '@/components/TaskProvider';
import { Toaster } from '@/components/ui/sonner';

import type { AppRouter } from '../../server';

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
});

/**
 * Root layout. Wraps all routes with TaskProvider and renders nested route content.
 */
function RootComponent() {
  return (
    <TaskProvider>
      <SkipOnScroll />
      <Outlet />
      <Toaster position='bottom-right' richColors />
    </TaskProvider>
  );
}
