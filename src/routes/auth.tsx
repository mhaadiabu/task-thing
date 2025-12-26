import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
      <div className='w-full h-screen max-w-md flex justify-center items-center'>
        <Outlet />
      </div>
    </div>
  );
}
