export default function Alerts() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">Alerts</h1>
      <p className="text-sm text-slate-500 mt-1">
        Critical patient alerts and system notifications
      </p>
      <div className="mt-8 bg-white rounded-card p-12 border border-slate-100 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <path d="M6 8a6 6 0 1 1 12 0v5l2 3H4l2-3V8z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Alerts coming soon</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Bed-shortage warnings, critical patient escalations, supply
          stock-outs, and other operational alerts will surface here.
        </p>
      </div>
    </main>
  );
}
