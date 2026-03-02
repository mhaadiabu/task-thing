import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background text-foreground'>
      <div className='flex h-screen w-full max-w-md items-center justify-center px-4'>
        <Outlet />
      </div>
    </div>
  );
}
