"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, businessName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      await signIn("credentials", {
        phone,
        password,
        callbackUrl: "/",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
      setLoading(false);
    }
  };

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
                Start your journey today.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Join thousands of businesses that trust BizMgr to handle their operations efficiently.
            </p>
            
            <div className="space-y-4">
                {[
                    "No credit card required for trial",
                    "Setup in less than 2 minutes",
                    "Cancel anytime",
                    "24/7 dedicated support"
                ].map((text, i) => (
                    <div key={i} className="flex items-center space-x-3 text-gray-700">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="font-medium">{text}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} BizMgr Inc.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm space-y-8 my-auto">
            <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-md text-sm flex items-center">
                       <span className="mr-2 h-4 w-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">!</span> 
                       {error}
                    </div>
                )}
                
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm transition-colors"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                        required
                        placeholder="Acme Inc"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm transition-colors"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        required
                        placeholder="+255..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm transition-colors"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                            Creating Account...
                        </>
                    ) : (
                         <>
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </button>
            </form>
            
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