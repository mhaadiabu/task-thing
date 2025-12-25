import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from '../../server';

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      // Since frontend and backend run on the same origin (same server),
      // we use a relative URL. This works in both development (Vite proxy)
      // and production (Express serves both API and static files).
      url: '/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Required for cookie-based auth
        });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
