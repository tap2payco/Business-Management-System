'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ArrowRight, Loader2, Command } from 'lucide-react';

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
        window.location.href = '/';
      }
    } catch (err) {
      setError('An error occurred during sign in');
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-50 p-12 border-r border-gray-100">
        <div className="flex items-center space-x-2">
           <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
           </div>
           <span className="text-xl font-bold text-gray-900 tracking-tight">BizMgr</span>
        </div>

        <div className="max-w-md">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                Manage your business with clarity.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                The all-in-one platform for invoicing, inventory, and customer management. Trusted by growing businesses everywhere.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                        <Command className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Automation</div>
                    <div className="text-sm text-gray-500">Streamline workflows</div>
                </div>
                 <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <div className="h-4 w-4 text-green-600 font-bold">$</div>
                    </div>
                    <div className="font-semibold text-gray-900">Finance</div>
                    <div className="text-sm text-gray-500">Track every penny</div>
                </div>
            </div>
        </div>

        <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} BizMgr Inc.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                        Start your 14-day free trial
                    </Link>
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-md text-sm flex items-center">
                       <span className="mr-2 h-4 w-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">!</span> 
                       {error}
                    </div>
                )}
                
                <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+255..."
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm transition-colors"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                         className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 disabled:cursor-not-allowed items-center transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </button>
            </form>
            
            {/* Forgot Password Link */}
            <div className="text-center mt-4">
                <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                    Forgot your password?
                </Link>
            </div>
            
            <div className="pt-8 border-t border-gray-100">
                <p className="text-xs text-center text-gray-500">
                    Designed and developed by <span className="font-semibold text-gray-700">Elespius</span> under <span className="font-semibold text-gray-700">Creotix Technologies</span> 
                    <br/>
                    <a href="https://www.creotix.tech" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline mt-1 inline-block">
                        www.creotix.tech
                    </a>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
