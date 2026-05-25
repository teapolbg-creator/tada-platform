'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AMBULANCES,
  STATS,
  type Ambulance,
  type AmbulanceStatus,
} from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Fleet Management (mockup 3).
// ---------------------------------------------------------------------------

export default function Fleet() {
  const [search, setSearch] = useState('');

  const filtered = AMBULANCES.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.code.toLowerCase().includes(q) || a.driverName.toLowerCase().includes(q)
    );
  });

  return (
    <main className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-button bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 mt-1"
          aria-label="Back to dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fleet Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and manage all ambulances
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
              <rect x="2" y="8" width="14" height="9" rx="1.5" />
              <path d="M16 11h4l2 3v3h-6V11z" />
            </svg>
          }
          iconBg="bg-blue-50"
          value={STATS.totalFleet}
          label="Total Fleet"
          valueColor="text-slate-900"
        />
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
          }
          iconBg="bg-green-50"
          value={STATS.available}
          label="Available"
          valueColor="text-green-600"
        />
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-tada-500">
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
          }
          iconBg="bg-tada-50"
          value={STATS.onDuty}
          label="On Duty"
          valueColor="text-tada-500"
        />
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500">
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
          }
          iconBg="bg-slate-100"
          value={STATS.offline}
          label="Offline"
          valueColor="text-slate-700"
        />
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-card p-3 mb-6 border border-slate-100 flex items-center gap-3">
        <div className="flex-1 flex items-center bg-slate-50 rounded-button px-3 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 mr-2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ambulance ID or driver name..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-button border border-slate-200 hover:bg-slate-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">Filter</span>
        </button>
      </div>

      {/* Ambulance list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-card p-8 text-center text-sm text-slate-400 border border-slate-100">
            No ambulances match your search.
          </div>
        ) : (
          filtered.map((amb) => <FleetCard key={amb.code} ambulance={amb} />)
        )}
      </div>
    </main>
  );
}

// ---- Stat card ----------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
  valueColor: string;
}

function StatCard({ icon, iconBg, value, label, valueColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-card p-5 border border-slate-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-button flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

// ---- Fleet card ---------------------------------------------------------

function FleetCard({ ambulance }: { ambulance: Ambulance }) {
  function handleCall() {
    alert(
      `Would call ${ambulance.driverName} (${ambulance.code}) — Hubtel Voice masked.`
    );
  }

  function handleViewDetails() {
    // TODO Module 5/6: navigate to /fleet/[code] detail page with trip history
    alert(`Detail view for ${ambulance.code} — to be built in a later turn.`);
  }

  const statusStyles = {
    available: { bg: 'bg-green-50', text: 'text-green-600', label: 'Available' },
    busy: { bg: 'bg-tada-50', text: 'text-tada-500', label: 'Busy' },
    offline: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Offline' },
  }[ambulance.status];

  const iconBgStyle = {
    available: 'bg-green-50 text-green-600',
    busy: 'bg-tada-50 text-tada-500',
    offline: 'bg-slate-100 text-slate-500',
  }[ambulance.status];

  return (
    <div className="bg-white rounded-card p-5 border border-slate-100">
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-card flex items-center justify-center shrink-0 ${iconBgStyle}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="8" width="14" height="9" rx="1.5" />
            <path d="M16 11h4l2 3v3h-6V11z" />
            <rect x="7" y="11" width="3" height="3" fill="white" opacity="0.6" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{ambulance.code}</h3>

              <div className="flex items-center gap-1.5 mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                <span className="text-sm text-slate-700">{ambulance.driverName}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" className="ml-2">
                  <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9 12 2" />
                </svg>
                <span className="text-sm font-semibold text-slate-900">
                  {ambulance.driverRating.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                <span className="text-sm text-slate-700">{ambulance.currentLocation}</span>
              </div>
            </div>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${statusStyles.bg} ${statusStyles.text}`}>
              {statusStyles.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm text-slate-500">
              Updated {ambulance.updatedMinutesAgo} min ago
            </span>
          </div>
          <div className="text-sm text-slate-500">
            Trips today: <span className="font-bold text-slate-900">{ambulance.tripsToday}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCall}
            className="w-10 h-10 rounded-button border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
            aria-label="Call driver"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          <button
            onClick={handleViewDetails}
            className="bg-dispatch-500 hover:bg-dispatch-600 text-white text-sm font-semibold px-4 py-2.5 rounded-button transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
