'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ADMINISTRATOR, HOSPITAL, SIDEBAR_STATS } from '@/lib/mockData';

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    label: 'Alerts',
    href: '/alerts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 8a6 6 0 1 1 12 0v5l2 3H4l2-3V8z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    router.push('/');
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tada-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M4 7c0-1.1 0.9-2 2-2h12c1.1 0 2 0.9 2 2v14H4V7z" />
              <rect x="9" y="9" width="6" height="2" fill="#E1252C" />
              <rect x="11" y="7" width="2" height="6" fill="#E1252C" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 leading-tight">
              {HOSPITAL.name}
            </div>
            <div className="text-xs text-slate-500">{HOSPITAL.department}</div>
          </div>
        </div>
      </div>

      {/* Administrator profile */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tada-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tada-500">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {ADMINISTRATOR.name}
            </div>
            <div className="text-xs text-slate-500 truncate">{ADMINISTRATOR.role}</div>
          </div>
        </div>
      </div>

      {/* Stat counters */}
      <div className="px-3 py-3 space-y-1.5">
        <StatRow label="Incoming" value={SIDEBAR_STATS.incoming} variant="danger" />
        <StatRow label="Beds" value={SIDEBAR_STATS.beds} variant="success" />
        <StatRow label="Staff" value={SIDEBAR_STATS.staff} variant="info" />
      </div>

      {/* Nav */}
      <nav className="px-3 py-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-semibold transition-colors mb-1 ${
                isActive
                  ? 'bg-tada-50 text-tada-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={isActive ? 'text-tada-500' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-semibold text-slate-600 hover:bg-slate-50 w-full transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l-5-5 5-5" />
            <path d="M5 12h12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ---- Stat row component --------------------------------------------------

interface StatRowProps {
  label: string;
  value: number;
  variant: 'danger' | 'info' | 'success';
}

function StatRow({ label, value, variant }: StatRowProps) {
  const styles = {
    danger: { bg: 'bg-tada-50', value: 'text-tada-500', iconColor: 'text-tada-500' },
    info: { bg: 'bg-blue-50', value: 'text-blue-600', iconColor: 'text-blue-500' },
    success: { bg: 'bg-green-50', value: 'text-green-600', iconColor: 'text-green-600' },
  }[variant];

  const Icon =
    variant === 'danger' ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="8" width="14" height="9" rx="1.5" />
        <path d="M16 11h4l2 3v3h-6V11z" />
      </svg>
    ) : variant === 'success' ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8c0-1.1 0.9-2 2-2h14c1.1 0 2 0.9 2 2v8h-4l-2 2H9l-2-2H3V8z" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="4" />
        <circle cx="17" cy="10" r="3" />
        <path d="M2 21a7 7 0 0 1 14 0" />
        <path d="M14 21a6 6 0 0 1 8 0" />
      </svg>
    );

  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-button ${styles.bg}`}>
      <div className="flex items-center gap-2.5">
        <span className={styles.iconColor}>{Icon}</span>
        <span className="text-sm font-semibold text-slate-900">{label}</span>
      </div>
      <span className={`text-base font-bold ${styles.value}`}>{value}</span>
    </div>
  );
}
