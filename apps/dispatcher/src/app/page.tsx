'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Operator Sign In (mockup 1).
 *
 * Option A: accepts any non-empty username + password. Real auth lands in
 * Module 9 — see BEFORE_LAUNCH.md item 2 ("Replace email/password with phone
 * OTP"). For dispatchers specifically, the production flow is more likely
 * a username + password backed by Supabase auth + a `dispatchers` profile
 * row, since dispatchers work from desks rather than personal phones.
 */
export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    // TODO Module 9: replace with real supabase.auth.signInWithPassword(...)
    // For now, any non-empty credentials work.
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-dispatch-500 flex items-center justify-center shadow-lg mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a7 7 0 0 0-7 7v3a3 3 0 0 0 3 3h1v-6H6v-0a6 6 0 1 1 12 0v0h-3v6h1a3 3 0 0 0 3-3v-3a7 7 0 0 0-7-7z"
                fill="white"
              />
              <path
                d="M15 16v2a2 2 0 0 1-2 2h-1v-2h1v-2h2z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TADA Dispatch</h1>
          <p className="text-slate-500 text-sm mt-1">Emergency Coordination Center</p>
        </div>

        {/* Sign in card */}
        <div className="bg-white rounded-card p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Operator Sign In</h2>
          <p className="text-slate-500 text-sm mt-1">
            Access the dispatch control system
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <div
                className={`flex items-center border rounded-button px-4 py-3 transition-colors ${
                  touched && !username.trim()
                    ? 'border-tada-500'
                    : 'border-slate-200 focus-within:border-dispatch-500'
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 mr-3"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operator.username"
                  className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 bg-transparent"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="flex items-center border border-slate-200 focus-within:border-dispatch-500 rounded-button px-4 py-3 transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 mr-3"
                >
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 bg-transparent"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Remember me + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mr-2 accent-dispatch-500"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-dispatch-500 hover:text-dispatch-600 font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-button py-3.5 font-semibold text-white transition-colors ${
                canSubmit
                  ? 'bg-tada-500 hover:bg-tada-600 shadow-lg'
                  : 'bg-tada-200 cursor-not-allowed'
              }`}
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>

        {/* Security notice */}
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-card p-4">
          <p className="text-sm text-amber-900">
            <span className="font-bold">🔒 Secure Access: </span>
            This system is for authorized dispatch personnel only. All activity
            is logged and monitored.
          </p>
        </div>

        {/* Dev mode notice */}
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-400">
            Dev mode — any non-empty credentials accepted
          </p>
        </div>
      </div>
    </main>
  );
}
