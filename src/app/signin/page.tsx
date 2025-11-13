
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
      } else if (result?.url) {
        window.location.href = result.url;
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
