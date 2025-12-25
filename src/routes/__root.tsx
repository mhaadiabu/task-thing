import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import TaskProvider from '@/components/TaskProvider';
// import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
// import { queryClient } from '../utils/trpc';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from 'server';
// import { useRouterState } from '@tanstack/react-router';

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
    // <QueryClientProvider client={queryClient}>
    <TaskProvider>
      <Outlet />
    </TaskProvider>
    // </QueryClientProvider>
  );
}
