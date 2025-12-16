import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // Point to backend server where Better Auth is running
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
