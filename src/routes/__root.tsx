import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import TaskProvider from '@/components/TaskProvider';
import type { QueryClient } from '@tanstack/react-query';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
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
      <Outlet />
    </TaskProvider>
  );
}
