'use client';

import Link from 'next/link';
import {
  BED_AVAILABILITY,
  BLOOD_BANK,
  MEDICAL_EQUIPMENT,
  STAFF_ON_DUTY,
  SUPPLIES,
  type StockLevel,
} from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Resource Management (mockups 4 + 5 + 6).
// ---------------------------------------------------------------------------

export default function Resources() {
  return (
    <main className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
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
            <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor and manage hospital resources
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-button px-3 py-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-green-700">
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Two-column top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BedAvailabilityCard />
        <StaffOnDutyCard />
      </div>

      {/* Medical Equipment */}
      <MedicalEquipmentCard />

      {/* Blood Bank & Supplies */}
      <BloodBankCard />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Bed Availability
// ---------------------------------------------------------------------------

function BedAvailabilityCard() {
  return (
    <div className="bg-white rounded-card p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-button bg-blue-50 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
            <path d="M3 8c0-1.1 0.9-2 2-2h14c1.1 0 2 0.9 2 2v8h-4l-2 2H9l-2-2H3V8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Bed Availability</h2>
          <p className="text-xs text-slate-500">Emergency department capacity</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <BedCell value={BED_AVAILABILITY.available} label="Available" bg="bg-green-50" textColor="text-green-600" />
        <BedCell value={BED_AVAILABILITY.occupied} label="Occupied" bg="bg-tada-50" textColor="text-tada-500" />
        <BedCell value={BED_AVAILABILITY.reserved} label="Reserved" bg="bg-amber-50" textColor="text-amber-600" />
        <BedCell value={BED_AVAILABILITY.total} label="Total" bg="bg-blue-50" textColor="text-blue-600" />
      </div>

      {/* Capacity bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-slate-500">Capacity</span>
          <span className="font-bold text-slate-900">{BED_AVAILABILITY.capacityPercent}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${BED_AVAILABILITY.capacityPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-button py-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 transition-colors">
          <span className="text-lg leading-none">+</span> Reserve Bed
        </button>
        <button className="bg-slate-50 hover:bg-slate-100 rounded-button py-3 text-sm font-semibold text-slate-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}

function BedCell({
  value,
  label,
  bg,
  textColor,
}: {
  value: number;
  label: string;
  bg: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-card p-4 ${bg}`}>
      <div className="text-sm text-slate-700 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Staff On Duty
// ---------------------------------------------------------------------------

function StaffOnDutyCard() {
  return (
    <div className="bg-white rounded-card p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-button bg-purple-50 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
            <circle cx="9" cy="8" r="4" />
            <circle cx="17" cy="10" r="3" />
            <path d="M2 21a7 7 0 0 1 14 0" />
            <path d="M14 21a6 6 0 0 1 8 0" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Staff On Duty</h2>
          <p className="text-xs text-slate-500">Current shift personnel</p>
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        <StaffRow
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
              <circle cx="12" cy="8" r="4" />
              <path d="M12 12v8M8 16h8" />
            </svg>
          }
          iconBg="bg-purple-50"
          label="Doctors"
          value={STAFF_ON_DUTY.doctors}
          valueColor="text-purple-600"
        />
        <StaffRow
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
              <path d="M12 21s-7-4.5-7-11a7 7 0 1 1 14 0c0 6.5-7 11-7 11z" />
            </svg>
          }
          iconBg="bg-blue-50"
          label="Nurses"
          value={STAFF_ON_DUTY.nurses}
          valueColor="text-blue-600"
        />
        <StaffRow
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
          }
          iconBg="bg-green-50"
          label="Paramedics"
          value={STAFF_ON_DUTY.paramedics}
          valueColor="text-green-600"
        />
        <StaffRow
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
              <circle cx="9" cy="8" r="4" />
              <circle cx="17" cy="10" r="3" />
              <path d="M2 21a7 7 0 0 1 14 0" />
              <path d="M14 21a6 6 0 0 1 8 0" />
            </svg>
          }
          iconBg="bg-slate-100"
          label="Support Staff"
          value={STAFF_ON_DUTY.supportStaff}
          valueColor="text-slate-700"
        />
      </div>

      <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-button py-3 text-sm font-semibold text-slate-700 transition-colors">
        Call Additional Staff
      </button>
    </div>
  );
}

function StaffRow({
  icon,
  iconBg,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  valueColor: string;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-card ${iconBg}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-base font-semibold text-slate-900">{label}</span>
      </div>
      <span className={`text-xl font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Medical Equipment
// ---------------------------------------------------------------------------

function MedicalEquipmentCard() {
  return (
    <div className="bg-white rounded-card p-6 border border-slate-100 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-button bg-green-50 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
            <path d="M3 12h4l3-9 4 18 3-9h4" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Medical Equipment</h2>
          <p className="text-xs text-slate-500">Available emergency equipment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MEDICAL_EQUIPMENT.map((item) => (
          <EquipmentCell key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

function EquipmentCell({ item }: { item: { name: string; inUse: number; total: number; stockLevel: StockLevel } }) {
  return (
    <div className="bg-white rounded-card p-4 border border-slate-100">
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-sm font-bold text-slate-900">{item.name}</span>
        <StockBadge level={item.stockLevel} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">{item.inUse}</span>
        <span className="text-sm text-slate-500">/ {item.total} available</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blood Bank & Supplies
// ---------------------------------------------------------------------------

function BloodBankCard() {
  function handleRequestStock() {
    alert('Stock request submitted — wires up to supply chain in a later module.');
  }

  return (
    <div className="bg-white rounded-card p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-button bg-tada-50 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tada-500">
              <ellipse cx="12" cy="6" rx="4" ry="2" />
              <path d="M8 6v12c0 1.1 1.8 2 4 2s4-0.9 4-2V6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Blood Bank & Supplies</h2>
            <p className="text-xs text-slate-500">Critical supplies inventory</p>
          </div>
        </div>
        <button
          onClick={handleRequestStock}
          className="bg-tada-500 hover:bg-tada-600 text-white text-sm font-semibold px-4 py-2.5 rounded-button transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Request Stock
        </button>
      </div>

      {/* Blood types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {BLOOD_BANK.map((blood) => (
          <BloodCell key={blood.type} blood={blood} />
        ))}
      </div>

      {/* Supplies (Emergency Meds + Surgical Supplies) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUPPLIES.map((supply) => (
          <SupplyCell key={supply.name} supply={supply} />
        ))}
      </div>
    </div>
  );
}

function BloodCell({ blood }: { blood: { type: string; units: number; stockLevel: StockLevel; stockPercent: number } }) {
  const barColor = blood.stockLevel === 'good' ? 'bg-green-500' : 'bg-amber-500';
  return (
    <div className="bg-white rounded-card p-4 border border-slate-100">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-bold text-slate-900">{blood.type}</span>
        <StockBadge level={blood.stockLevel} />
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-slate-900">{blood.units}</span>
        <span className="text-sm text-slate-500">units</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full`}
          style={{ width: `${blood.stockPercent}%` }}
        />
      </div>
    </div>
  );
}

function SupplyCell({ supply }: { supply: { name: string; stockedPercent: number; stockLevel: StockLevel } }) {
  const barColor = supply.stockLevel === 'good' ? 'bg-green-500' : 'bg-amber-500';
  return (
    <div className="bg-white rounded-card p-4 border border-slate-100">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-bold text-slate-900">{supply.name}</span>
        <StockBadge level={supply.stockLevel} />
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-slate-900">
          {supply.stockedPercent}%
        </span>
        <span className="text-sm text-slate-500">stocked</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full`}
          style={{ width: `${supply.stockedPercent}%` }}
        />
      </div>
    </div>
  );
}

// ---- Stock level badge ---------------------------------------------------

function StockBadge({ level }: { level: StockLevel }) {
  const styles = {
    good: 'bg-green-50 text-green-700',
    available: 'bg-green-50 text-green-700',
    low: 'bg-amber-50 text-amber-700',
    critical: 'bg-tada-50 text-tada-500',
  }[level];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${styles}`}>
      {level}
    </span>
  );
}
