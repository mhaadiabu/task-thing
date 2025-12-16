import { createRootRoute, Outlet } from '@tanstack/react-router';
import TaskProvider from '@/components/TaskProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../utils/trpc';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        <Outlet />
      </TaskProvider>
    </QueryClientProvider>
  );
}
