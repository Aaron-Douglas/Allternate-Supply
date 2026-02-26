'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const err = searchParams?.get('error');
    if (err === 'staff_required') {
      setError('Your account does not have access to the admin panel.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    const redirectTo = searchParams?.get('redirect') || '/admin/dashboard';
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Staff Login</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to access the admin panel</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
        <div>
          <Label htmlFor="email" required>Email</Label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px]"
          />
        </div>
        <div>
          <Label htmlFor="password" required>Password</Label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px]"
          />
        </div>
        {error && <ErrorMessage message={error} />}
        <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
          Sign In
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="w-full max-w-sm rounded-xl bg-white p-6 border border-gray-200 shadow-sm animate-pulse h-[320px]" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
