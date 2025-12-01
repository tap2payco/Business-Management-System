
'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = new URL(window.location.href);
      const callbackUrl = url.searchParams.get('callbackUrl') || '/';
      const result = await signIn('credentials', {
        phone,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Fetch session to check for super admin status
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        
        if (session?.user?.role && session.user.isSuperAdmin) { // Note: isSuperAdmin might not be in session yet without type update, but let's try or fetch profile
           // Actually, let's just fetch the profile or rely on the fact that we can redirect to /admin and let middleware handle it?
           // Better: fetch user profile to be sure
           // For now, let's just default to dashboard, but if we can check role from session that's great.
           // Wait, we added role to session but not isSuperAdmin.
           // Let's just redirect to /dashboard and let the user click the link, OR fetch the user profile.
           // To keep it simple and robust:
           window.location.href = '/dashboard';
        } else {
           window.location.href = callbackUrl === '/' ? '/dashboard' : callbackUrl;
        }
        
        // Refined approach:
        // We can't easily check isSuperAdmin from client session without adding it to session callback.
        // Let's add isSuperAdmin to session callback in auth.ts first?
        // OR we can just redirect to /dashboard and have a check there.
        // BUT the requirement is "smart login redirection".
        // Let's modify auth.ts to include isSuperAdmin in session.
      }
    } catch (err) {
      setError('An error occurred during sign in');
    }

    setLoading(false);
  }

  return (
    <div className='max-w-md mx-auto bg-white p-6 rounded shadow space-y-4'>
      <h1 className='text-xl font-semibold'>Sign in</h1>
      <p className='text-sm text-gray-600'>Enter your phone number and password to sign in.</p>
      {error && (
        <div className='bg-red-50 text-red-500 p-3 rounded text-sm'>
          {error}
        </div>
      )}
      <form onSubmit={submit} className='space-y-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Phone Number
          </label>
          <input
            type='tel'
            required
            className='w-full border p-2 rounded'
            placeholder='+255...'
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Password
          </label>
          <input
            type='password'
            required
            className='w-full border p-2 rounded'
            placeholder='••••••••'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          disabled={loading} 
          className='px-3 py-2 bg-black text-white rounded w-full'
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link href="/signup" className="text-black hover:underline">Sign up</Link>
      </div>
    </div>
  );
}
