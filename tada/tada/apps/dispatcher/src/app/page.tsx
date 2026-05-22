import {
  formatCurrency,
  formatDistance,
  TRIP_STATUS_LABELS,
  GHANA,
  PRIORITY_LABELS,
} from '@tada/shared';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-tada-500">TADA Dispatcher</h1>
        <p className="text-slate-500 mt-1">Operator dashboard — pilot build</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div className="bg-white rounded-card p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Shared package check</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(30000)}</p>
          <p className="text-xs text-slate-400 mt-1">
            Currency: {GHANA.currencyCode} · Distance demo: {formatDistance(7400)}
          </p>
        </div>

        <div className="bg-white rounded-card p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Priority labels</p>
          <ul className="text-sm text-slate-900 space-y-1">
            <li>Critical: {PRIORITY_LABELS.critical}</li>
            <li>Urgent: {PRIORITY_LABELS.urgent}</li>
            <li>Standard: {PRIORITY_LABELS.standard}</li>
          </ul>
        </div>

        <div className="bg-white rounded-card p-6 shadow-sm border border-slate-200 md:col-span-2">
          <p className="text-sm text-slate-500 mb-2">Trip status check</p>
          <p className="text-sm text-slate-900">
            requested → {TRIP_STATUS_LABELS.requested} ·{' '}
            en_route_to_pickup → {TRIP_STATUS_LABELS.en_route_to_pickup} ·{' '}
            completed → {TRIP_STATUS_LABELS.completed}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-10">
        If you can read this, the dispatcher dashboard is wired up correctly.
      </p>
    </main>
  );
}
