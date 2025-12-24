import { createAuthClient } from 'better-auth/react';

// Use relative URL to leverage Vite's proxy in development
// This ensures cookies are set on the same origin, avoiding cross-origin cookie issues
export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL // Use full URL in production
    : '', // Use relative URL in development (Vite proxy handles /api/auth)
  fetchOptions: {
    credentials: 'include', // Required for cookie-based auth
  },
});

// Helper function to check if user is authenticated
export const useAuth = () => {
  const session = authClient.useSession();

  return {
    user: session.data?.user || null,
    session: session.data?.session || null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    error: session.error,
  };
};
