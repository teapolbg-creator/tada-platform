'use client';

import { useState } from 'react';
import {
  AMBULANCES,
  REQUESTS,
  type EmergencyRequest,
  type RequestPriority,
  type RequestStatus,
} from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Live Operations dashboard (mockup 2).
// Reads from mockData. Buttons are demo-only; see TODO comments for the
// Module 5 replacement points.
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [search, setSearch] = useState('');

  const filteredRequests = REQUESTS.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.id.toLowerCase().includes(q) ||
      r.patientName.toLowerCase().includes(q) ||
      r.pickupAddress.toLowerCase().includes(q)
    );
  });

  return (
    <main className="flex h-screen">
      {/* Center: header + map */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <div className="px-8 py-5 flex items-start justify-between border-b border-slate-100 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Operations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time emergency coordination
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-button px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-700">
                System Active
              </span>
            </div>
            <button className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                <path d="M6 8a6 6 0 1 1 12 0v5l2 3H4l2-3V8z" />
                <path d="M10 19a2 2 0 0 0 4 0" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tada-500" />
            </button>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 p-6 overflow-hidden">
          <MapPanel />
        </div>
      </div>

      {/* Right: Request queue */}
      <aside className="w-96 border-l border-slate-200 bg-white flex flex-col h-screen">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Request Queue</h2>
            <button className="w-9 h-9 rounded-button border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>
          <div className="flex items-center bg-slate-50 rounded-button px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 mr-2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-8">
              No requests match your search.
            </div>
          ) : (
            filteredRequests.map((req) => <RequestCard key={req.id} request={req} />)
          )}
        </div>
      </aside>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Map panel — placeholder showing ambulance pins
// Replaced by real react-native-maps / mapbox-gl-js when Module 11
// (Maps Scope B/C) lands.
// ---------------------------------------------------------------------------

function MapPanel() {
  return (
    <div className="relative w-full h-full bg-slate-100 rounded-card overflow-hidden border border-slate-200">
      {/* Faux grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Pins */}
      {AMBULANCES.filter((a) => a.status !== 'offline').map((amb) => (
        <div
          key={amb.code}
          className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${amb.mapPosition.x * 100}%`,
            top: `${amb.mapPosition.y * 100}%`,
          }}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              amb.status === 'available' ? 'bg-green-500' : 'bg-tada-500'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <rect x="2" y="8" width="14" height="9" rx="1.5" />
              <path d="M16 11h4l2 3v3h-6V11z" />
              <rect x="7" y="11" width="3" height="3" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <div className="bg-white px-2 py-1 rounded-md mt-1.5 shadow-sm border border-slate-100">
            <span className="text-xs font-semibold text-slate-900">{amb.code}</span>
          </div>
        </div>
      ))}

      {/* Location label */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1.5 rounded-button shadow-sm border border-slate-100">
        <span className="text-xs font-semibold text-slate-700">Accra, Ghana</span>
      </div>

      {/* Map controls (right side, like in mockup) */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        <button className="w-10 h-10 rounded-button bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-button bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-700">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-button bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-700">
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Placeholder note */}
      <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-button border border-slate-100 text-xs text-slate-500">
        Map placeholder — real map renders in Module 11
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Request card
// ---------------------------------------------------------------------------

function RequestCard({ request }: { request: EmergencyRequest }) {
  function handleDispatch() {
    // TODO Module 5: call assign-trip Edge Function
    alert(
      `Dispatching ${request.id} — real assignment lands when Module 5 backend is wired.`
    );
  }

  function handleCall() {
    // TODO Module 12: call patient via Hubtel Voice (number masking)
    alert(`Would call ${request.patientName} via Hubtel Voice masked number.`);
  }

  return (
    <div
      className={`bg-white border border-slate-200 rounded-card p-4 ${
        request.priority === 'high' ? 'priority-pulse border-tada-200' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500">{request.id}</span>
        <PriorityBadge priority={request.priority} />
      </div>

      <h3 className="text-base font-bold text-slate-900">{request.patientName}</h3>

      <div className="flex items-center gap-1.5 mt-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
          <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" />
          <circle cx="12" cy="9" r="3" />
        </svg>
        <span className="text-sm text-slate-700">{request.pickupAddress}</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-sm text-slate-500">{request.minutesAgo} min ago</span>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Bottom: Dispatch button + Call (pending) or assigned ambulance row */}
      {request.status === 'pending' ? (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleDispatch}
            className="flex-1 bg-dispatch-500 hover:bg-dispatch-600 text-white text-sm font-semibold py-2.5 rounded-button transition-colors"
          >
            Dispatch
          </button>
          <button
            onClick={handleCall}
            className="w-10 h-10 rounded-button border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
            aria-label="Call patient"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      ) : request.assignedAmbulance ? (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
            <rect x="2" y="8" width="14" height="9" rx="1.5" />
            <path d="M16 11h4l2 3v3h-6V11z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">
            {request.assignedAmbulance.code}
          </span>
          <span className="text-sm text-slate-400">
            · {request.assignedAmbulance.distanceKm} km
          </span>
        </div>
      ) : null}
    </div>
  );
}

// ---- Badges --------------------------------------------------------------

function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const styles = {
    high: 'bg-tada-50 text-tada-500',
    medium: 'bg-amber-50 text-amber-600',
    low: 'bg-blue-50 text-blue-600',
  }[priority];
  const label = priority.toUpperCase();
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${styles}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700',
    active: 'bg-blue-50 text-blue-700',
    arriving: 'bg-blue-50 text-blue-700',
  }[status];
  const label = status[0]!.toUpperCase() + status.slice(1);
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${styles}`}>
      {label}
    </span>
  );
}
