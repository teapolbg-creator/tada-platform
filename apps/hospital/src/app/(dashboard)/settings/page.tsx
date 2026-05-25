export default function Settings() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-500 mt-1">
        Hospital preferences and integration configuration
      </p>
      <div className="mt-8 bg-white rounded-card p-12 border border-slate-100 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Settings coming soon</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Bed-capacity rules, on-call rosters, TADA dispatch integration, and
          hospital preferences will live here.
        </p>
      </div>
    </main>
  );
}
