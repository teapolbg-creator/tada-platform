import { TRIP_STATUS_LABELS, PRIORITY_LABELS } from '@tada/shared';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-tada-500">TADA Hospital</h1>
        <p className="text-slate-500 mt-1">ER dashboard — pilot build</p>
      </header>

      <div className="bg-white rounded-card p-6 shadow-sm border border-slate-200 max-w-3xl">
        <p className="text-sm text-slate-500 mb-2">Incoming patients will appear here</p>
        <p className="text-xs text-slate-400">
          Status labels available: {TRIP_STATUS_LABELS.en_route_to_hospital},{' '}
          {TRIP_STATUS_LABELS.arrived_at_hospital}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Priority labels: {PRIORITY_LABELS.critical}, {PRIORITY_LABELS.urgent},{' '}
          {PRIORITY_LABELS.standard}
        </p>
      </div>

      <p className="text-xs text-slate-400 mt-10">
        If you can read this, the hospital dashboard is wired up correctly.
      </p>
    </main>
  );
}
