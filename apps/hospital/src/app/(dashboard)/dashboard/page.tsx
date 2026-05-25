'use client';

import {
  ER_CAPACITY,
  INCOMING_PATIENTS,
  RECENT_ADMISSIONS,
  type IncomingPatient,
  type PatientPriority,
  type RecentAdmission,
} from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Emergency Room Status (mockup 3 + 2).
// ---------------------------------------------------------------------------

export default function Dashboard() {
  return (
    <main className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Emergency Room Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time incoming patient monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-button px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-green-700">
              {ER_CAPACITY.status}
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-button px-3 py-1.5">
            <span className="text-sm text-blue-900">
              Capacity:{' '}
              <span className="font-bold">{ER_CAPACITY.capacityPercent}%</span>
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

      {/* Incoming patients section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Incoming Patients</h2>
          <span className="text-sm text-slate-500">
            {INCOMING_PATIENTS.length} en route
          </span>
        </div>

        <div className="space-y-4">
          {INCOMING_PATIENTS.map((patient) => (
            <PatientCard key={patient.patientId} patient={patient} />
          ))}
        </div>
      </section>

      {/* Recent admissions */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Admissions</h2>
        <div className="bg-white rounded-card border border-slate-100 divide-y divide-slate-100">
          {RECENT_ADMISSIONS.map((admission) => (
            <AdmissionRow key={admission.patientId} admission={admission} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Patient card
// ---------------------------------------------------------------------------

function PatientCard({ patient }: { patient: IncomingPatient }) {
  function handleCall() {
    alert(
      `Would call ${patient.paramedicName} (${patient.ambulanceCode}) via Hubtel Voice masked number.`
    );
  }

  function handlePrepareBed() {
    // TODO Module 5: write to trips.bed_prepared_at + flip a flag on the
    // hospital_staff side. Notifies the paramedic via the driver app.
    alert(
      `Bed preparation acknowledged for ${patient.name} — wires up when Module 5 is built.`
    );
  }

  const priorityBorderColor = {
    high: 'bg-tada-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
  }[patient.priority];

  return (
    <div
      className={`relative bg-white rounded-card border border-slate-100 overflow-hidden ${
        patient.priority === 'high' ? 'priority-pulse' : ''
      }`}
    >
      {/* Priority left border */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${priorityBorderColor}`}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: patient info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
              <span className="text-sm text-slate-400 font-mono">
                {patient.patientId}
              </span>
              <PriorityBadge priority={patient.priority} />
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <path d="M12 21s-7-4.5-7-11a7 7 0 1 1 14 0c0 6.5-7 11-7 11z" />
              </svg>
              <span>{patient.bloodType}</span>
              <span className="text-slate-300">·</span>
              <span>{patient.condition}</span>
            </div>

            {/* Medical info card */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-card px-4 py-3">
              <div className="flex items-center gap-2 text-amber-900 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h0.01" />
                </svg>
                <span className="text-sm font-bold">Medical Information</span>
              </div>
              <p className="text-sm text-amber-900">
                Allergies:{' '}
                <span className="font-semibold">{patient.allergies}</span>
                {'  ·  '}
                Conditions:{' '}
                <span className="font-semibold">{patient.preExisting}</span>
              </p>
            </div>

            {/* Ambulance + paramedic + pickup row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InfoColumn
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="8" width="14" height="9" rx="1.5" />
                    <path d="M16 11h4l2 3v3h-6V11z" />
                  </svg>
                }
                label="Ambulance"
                value={patient.ambulanceCode}
              />
              <InfoColumn
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                }
                label="Paramedic"
                value={patient.paramedicName}
              />
              <InfoColumn
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                }
                label="Pickup"
                value={patient.pickupAddress}
              />
            </div>
          </div>

          {/* Right side: ETA + actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-stretch gap-2">
              <div className="bg-tada-500 text-white rounded-card px-4 py-2 flex flex-col items-center min-w-[88px]">
                <div className="flex items-center gap-1 text-xs">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  ETA
                </div>
                <div className="text-lg font-bold">{patient.etaMinutes} min</div>
              </div>
              <button
                onClick={handleCall}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-card px-3 py-2 flex flex-col items-center justify-center gap-1 min-w-[68px]"
                aria-label="Call paramedic"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-xs font-semibold text-slate-700">Call</span>
              </button>
            </div>
            <div className="text-xs text-slate-500">{patient.distanceKm} km away</div>
            <button
              onClick={handlePrepareBed}
              className="bg-tada-500 hover:bg-tada-600 text-white text-sm font-semibold px-5 py-2.5 rounded-button transition-colors shadow-sm w-full"
            >
              Prepare Bed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Helpers --------------------------------------------------------------

function PriorityBadge({ priority }: { priority: PatientPriority }) {
  const styles = {
    high: 'bg-tada-50 text-tada-500',
    medium: 'bg-amber-50 text-amber-600',
    low: 'bg-blue-50 text-blue-600',
  }[priority];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${styles}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function InfoColumn({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function AdmissionRow({ admission }: { admission: RecentAdmission }) {
  const formatTime = (mins: number) =>
    mins >= 60
      ? `${Math.floor(mins / 60)} hour${mins >= 120 ? 's' : ''} ago`
      : `${mins} min ago`;

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-base font-bold text-slate-900">{admission.name}</div>
        <div className="text-sm text-slate-500 mt-0.5">
          <span className="font-mono">{admission.patientId}</span>
          {' · '}
          Admitted {formatTime(admission.admittedMinutesAgo)}
        </div>
      </div>
      <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-md">
        Completed
      </span>
    </div>
  );
}
