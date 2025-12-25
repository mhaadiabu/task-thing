import { createAuthClient } from 'better-auth/react';

// Use relative URL (empty baseURL) since frontend and backend run on the same origin
// - Development: Vite proxy forwards /api/auth to the Express server
// - Production: Express serves both static files and API from the same origin
export const authClient = createAuthClient({
  baseURL: '', // Same-origin requests work in both dev and prod
  fetchOptions: {
    credentials: 'include', // Required for cookie-based auth
  },
});
