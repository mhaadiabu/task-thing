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
 * Provides the application's root UI tree with React Query and task contexts and renders nested route content.
 *
 * @returns The root React element containing a QueryClientProvider (using `queryClient`), a TaskProvider, and an Outlet for nested routes.
 */
function RootComponent() {
  return (
    <TaskProvider>
      <Outlet />
    </TaskProvider>
  );
}
