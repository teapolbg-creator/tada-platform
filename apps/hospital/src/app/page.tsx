'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Administrator Sign In (mockup 1).
 *
 * Option A: accepts any non-empty username + password. Real auth lands in
 * Module 9 — hospitals authenticate against the `hospital_staff` table.
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
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-tada-500 flex items-center justify-center shadow-lg mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M4 7c0-1.1 0.9-2 2-2h12c1.1 0 2 0.9 2 2v14H4V7z" />
              <rect x="9" y="9" width="6" height="2" fill="#E1252C" />
              <rect x="11" y="7" width="2" height="6" fill="#E1252C" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TADA Hospital</h1>
          <p className="text-slate-500 text-sm mt-1">Emergency Management Portal</p>
        </div>

        {/* Sign in card */}
        <div className="bg-white rounded-card p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Administrator Sign In</h2>
          <p className="text-slate-500 text-sm mt-1">
            Access incoming patient management
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
                    : 'border-slate-200 focus-within:border-tada-500'
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
                  placeholder="admin.username"
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
              <div className="flex items-center border border-slate-200 focus-within:border-tada-500 rounded-button px-4 py-3 transition-colors">
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

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mr-2 accent-tada-500"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-tada-500 hover:text-tada-600 font-semibold"
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
              Sign In to Portal
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-card p-4">
          <p className="text-sm text-blue-900">
            <span className="font-bold">🏥 Hospital Portal: </span>
            Monitor incoming emergency patients, manage resources, and
            coordinate with TADA dispatch.
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
