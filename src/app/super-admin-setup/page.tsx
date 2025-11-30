"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SuperAdminSetup() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePromote() {
    if (!session) {
      setStatus('You must be logged in to use this tool.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/super-admin-setup', {
        method: 'POST',
      });

      if (res.ok) {
        setStatus('Success! You are now a Super Admin. Redirecting...');
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-red-600">⚠️ One-Time Setup</h1>
        <p className="mb-6 text-gray-700">
          This page allows you to promote your current account to <strong>Super Admin</strong>.
          <br /><br />
          <strong>Please delete this page and the API route after use!</strong>
        </p>

        {session ? (
          <div className="text-center">
            <p className="mb-4">Logged in as: <strong>{session.user?.name || session.user?.email || session.user?.phone}</strong></p>
            <button
              onClick={handlePromote}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Make Me Super Admin'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-red-500">You are not logged in.</p>
            <button
              onClick={() => router.push('/signin')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {status && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-center text-sm font-medium">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
