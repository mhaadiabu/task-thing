import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
});

/**
 * Render the sign-in page containing an email/password form and client-side authentication flow.
 *
 * Renders input fields for email and password, manages local form and UI state (error and success messages, loading),
 * submits credentials via the authentication client, displays feedback on error or success, disables inputs while
 * a request is in progress, and navigates to the root path after successful sign-in.
 *
 * @returns The JSX element for the sign-in page.
 */
function SignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((formValues) => ({ ...formValues, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const { data, error } = await authClient.signIn.email({
      ...formData,
      callbackURL: '/',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      setSuccessMessage('Signed in successfully!');
      // Delay to ensure cookies are properly set before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force a session refresh to ensure the client picks up the new cookies
      await authClient.getSession({ fetchOptions: { cache: 'no-store' } });

      setIsLoading(false);
      navigate({ to: '/' });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Sign In</h1>
        <p className='text-muted-foreground'>
          Enter your information to continue
        </p>
      </div>

      {errorMessage && (
        <div className='p-3 rounded-md bg-destructive/10 border border-destructive/20'>
          <p className='text-sm text-destructive'>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className='p-3 rounded-md bg-green-100 border border-green-200'>
          <p className='text-sm text-green-800'>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            type='email'
            id='email'
            name='email'
            placeholder='you@example.com'
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            type='password'
            id='password'
            name='password'
            placeholder='••••••••'
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          <p className='text-xs text-muted-foreground'>
            Must be at least 8 characters long
          </p>
        </div>

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <Spinner />
              <span className='ml-2'>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className='text-center text-sm'>
        <span className='text-muted-foreground'>
          Don&apos;t have an account?{' '}
        </span>
        <Link
          to='/auth/sign-up'
          className='text-primary hover:underline font-medium'
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
