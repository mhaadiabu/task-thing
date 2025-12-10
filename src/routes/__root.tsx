import { createRootRoute, Outlet } from '@tanstack/react-router';
import TaskProvider from '@/components/TaskProvider';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <TaskProvider>
      <Outlet />
    </TaskProvider>
  );
}
