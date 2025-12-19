import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000', // Point to backend server where Better Auth is running
});

// Helper function to check if user is authenticated
export const useAuth = () => {
  const session = authClient.useSession();

  return {
    user: session.data?.user,
    session: session.data?.session,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    error: session.error,
  };
};
