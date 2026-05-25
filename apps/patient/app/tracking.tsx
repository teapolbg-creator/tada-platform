import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { launchDialer, PILOT_PLACEHOLDER_NUMBERS } from '../src/lib/telephony';

// ---------------------------------------------------------------------------
// Live Tracking screen
//
// Replaces the previous En Route screen. Merges the live tracking visual
// (Image 1/2/3) with the existing en route helper sections (call paramedic,
// first aid, triage, timeline).
//
// Three trip status states drive the screen's appearance:
//   - en_route     : Ambulance moving toward patient. Cancel link visible.
//   - arrived      : Ambulance at pickup. Notification banner. "Please board safely".
//   - to_hospital  : Patient onboard, en route to hospital. Notification banner.
//
// Simulation: status auto-cycles for demo purposes. When Module 5 wires the
// real trip backend, this gets replaced by a Supabase subscription that
// listens for trip status changes pushed by the driver app. See the
// `simulateTripProgress()` block below.
// ---------------------------------------------------------------------------

type TripStatus = 'en_route' | 'arrived' | 'to_hospital';

// Simulation timings (replaced by real subscription in Module 5)
const EN_ROUTE_DURATION_MS = 10_000;
const ARRIVED_DURATION_MS = 6_000;
const TO_HOSPITAL_DURATION_MS = 10_000;
const NOTIFICATION_DISMISS_MS = 5_000;

// ---------------------------------------------------------------------------
// Placeholder trip data — replaced by real trip record in Module 5
// ---------------------------------------------------------------------------
const TRIP = {
  driverName: 'Kwame Asante',
  driverRole: 'Paramedic',
  ambulanceCode: 'AMB-GH-2847',
  rating: 4.9,
  ratingCount: 342,
  paramedicPhone: PILOT_PLACEHOLDER_NUMBERS.paramedic,
  firstAidPhone: PILOT_PLACEHOLDER_NUMBERS.firstAidHotline,
  etaMinutes: 3,
  distanceKm: 1.2,
  pickupAddress: 'Independence Avenue, Ridge',
  emergencyContactName: 'Abena Mensah',
};

// Per-state strings and styles
const STATUS_CONFIG: Record<
  TripStatus,
  {
    statusLabel: string;
    statusColor: string;
    notice: string;
    noticeIcon: string;
    banner: { title: string; subtitle: string } | null;
  }
> = {
  en_route: {
    statusLabel: 'En Route',
    statusColor: '#2563EB', // blue
    notice: 'Ambulance is on the way to your location',
    noticeIcon: '🚑',
    banner: null,
  },
  arrived: {
    statusLabel: 'Arrived',
    statusColor: '#22C55E', // green
    notice: 'Ambulance has arrived. Please board safely.',
    noticeIcon: '✓',
    banner: {
      title: 'TADA Emergency',
      subtitle: 'Ambulance has arrived at your location',
    },
  },
  to_hospital: {
    statusLabel: 'To Hospital',
    statusColor: '#EA580C', // orange
    notice: 'You are being transported to the hospital',
    noticeIcon: '🏥',
    banner: {
      title: 'TADA Emergency',
      subtitle: 'On the way to hospital',
    },
  },
};

export default function Tracking() {
  // --- Trip state -----------------------------------------------------------
  const [tripStatus, setTripStatus] = useState<TripStatus>('en_route');
  const [bannerVisible, setBannerVisible] = useState(false);

  // --- Triage state from params (unchanged from old en-route logic) ---------
  const params = useLocalSearchParams<{
    triage?: string;
    whoNeedsHelp?: string;
    emergencyType?: string;
    numberOfPatients?: string;
    consciousState?: string;
    description?: string;
  }>();

  const triageStatus: 'initial' | 'skipped' | 'saved' =
    params.triage === 'saved'
      ? 'saved'
      : params.triage === 'skipped'
        ? 'skipped'
        : 'initial';

  // --- Simulated trip progression ------------------------------------------
  // TODO: Module 5 — replace with Supabase realtime subscription:
  //   supabase
  //     .channel(`trip:${tripId}`)
  //     .on('postgres_changes', { table: 'trips', filter: `id=eq.${tripId}` },
  //         (payload) => setTripStatus(payload.new.status))
  //     .subscribe();
  // The state machine in the DB enforces valid transitions; driver app
  // triggers `arrived` → `to_hospital` → `completed`.
  useEffect(() => {
    function simulateTripProgress() {
      // en_route → arrived after EN_ROUTE_DURATION_MS
      const toArrived = setTimeout(() => {
        setTripStatus('arrived');
      }, EN_ROUTE_DURATION_MS);

      // arrived → to_hospital after EN_ROUTE_DURATION_MS + ARRIVED_DURATION_MS
      const toHospital = setTimeout(
        () => {
          setTripStatus('to_hospital');
        },
        EN_ROUTE_DURATION_MS + ARRIVED_DURATION_MS
      );

      // to_hospital → /payment
      const toPayment = setTimeout(
        () => {
          router.replace('/payment');
        },
        EN_ROUTE_DURATION_MS + ARRIVED_DURATION_MS + TO_HOSPITAL_DURATION_MS
      );

      return () => {
        clearTimeout(toArrived);
        clearTimeout(toHospital);
        clearTimeout(toPayment);
      };
    }

    return simulateTripProgress();
  }, []);

  // --- Banner shows briefly on state transitions to arrived / to_hospital ---
  useEffect(() => {
    if (tripStatus === 'en_route') return; // no banner on initial state
    setBannerVisible(true);
    const t = setTimeout(() => setBannerVisible(false), NOTIFICATION_DISMISS_MS);
    return () => clearTimeout(t);
  }, [tripStatus]);

  // --- Hardware back disabled (same as old En Route) ------------------------
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // --- Handlers -------------------------------------------------------------
  function callParamedic() {
    launchDialer(TRIP.paramedicPhone);
  }

  function messageParamedic() {
    // In-app messaging arrives in a later module. For now, show a stub.
    if (Platform.OS === 'web') {
      const w = globalThis as { alert?: (m: string) => void };
      w.alert?.('In-app messaging arrives in a later module.');
    } else {
      Alert.alert('Coming soon', 'In-app messaging arrives in a later module.');
    }
  }

  function callFirstAid() {
    launchDialer(TRIP.firstAidPhone);
  }

  function provideEmergencyDetails() {
    router.push('/triage');
  }

  function editEmergencyDetails() {
    router.push({
      pathname: '/triage',
      params: {
        whoNeedsHelp: params.whoNeedsHelp ?? '',
        emergencyType: params.emergencyType ?? '',
        numberOfPatients: params.numberOfPatients ?? '1',
        consciousState: params.consciousState ?? '',
        description: params.description ?? '',
      },
    });
  }

  function addEmergencyDetails() {
    router.push('/triage');
  }

  function promptCancel() {
    const onConfirm = () => router.replace('/home');

    if (Platform.OS === 'web') {
      const w = globalThis as { confirm?: (m: string) => boolean };
      const ok = w.confirm?.(
        'Cancel this emergency request? The paramedic will be notified.'
      );
      if (ok) onConfirm();
      return;
    }

    Alert.alert(
      'Cancel emergency request?',
      'The paramedic will be notified that you no longer need assistance.',
      [
        { text: 'Keep request', style: 'cancel' },
        {
          text: 'Cancel request',
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  }

  const config = STATUS_CONFIG[tripStatus];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Notification banner — only shows on arrival + transition to hospital */}
      {config.banner && bannerVisible ? (
        <View className="px-4 pt-2">
          <View
            style={{
              backgroundColor: '#0F172A',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <View className="w-9 h-9 rounded-full bg-green-500 items-center justify-center mr-3">
              <Text className="text-white text-base">🔔</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-bold">
                {config.banner.title}
              </Text>
              <Text className="text-white/80 text-xs mt-0.5">
                {config.banner.subtitle}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <ScrollView
        contentContainerClassName="px-6 py-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Map placeholder card (real map in Maps Scope C) */}
        <MapPlaceholder tripStatus={tripStatus} />

        {/* Driver card */}
        <View className="bg-white rounded-card p-5 mt-3 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-4">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                {TRIP.driverName}
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                {TRIP.driverRole} · {TRIP.ambulanceCode}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-sm">⭐</Text>
                <Text className="text-gray-900 text-sm font-semibold ml-1">
                  {TRIP.rating}
                </Text>
                <Text className="text-gray-500 text-sm ml-1">
                  ({TRIP.ratingCount} trips)
                </Text>
              </View>
            </View>
          </View>

          {/* Stat row: Distance / ETA / Status */}
          <View className="flex-row">
            <StatBlock label="Distance" value={`${TRIP.distanceKm} km`} bg="#F3F4F6" />
            <View style={{ width: 8 }} />
            <StatBlock
              label="ETA"
              value={`${TRIP.etaMinutes} min`}
              bg="#FEF2F2"
              valueColor="#E1252C"
            />
            <View style={{ width: 8 }} />
            <StatBlock
              label="Status"
              value={config.statusLabel}
              bg="#EFF6FF"
              valueColor={config.statusColor}
            />
          </View>

          {/* Call + Message two-up */}
          <View className="flex-row mt-4">
            <Pressable
              onPress={callParamedic}
              className="flex-1 bg-gray-100 active:bg-gray-200 rounded-button py-4 mr-2 flex-row items-center justify-center"
            >
              <Text className="text-lg mr-2">📞</Text>
              <Text className="text-gray-900 text-base font-semibold">Call</Text>
            </Pressable>
            <Pressable
              onPress={messageParamedic}
              className="flex-1 bg-gray-100 active:bg-gray-200 rounded-button py-4 ml-2 flex-row items-center justify-center"
            >
              <Text className="text-lg mr-2">💬</Text>
              <Text className="text-gray-900 text-base font-semibold">Message</Text>
            </Pressable>
          </View>
        </View>

        {/* State-driven blue notice */}
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
            marginTop: 12,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-base mr-2">{config.noticeIcon}</Text>
            <Text className="text-blue-900 text-sm font-semibold">
              {config.notice}
            </Text>
          </View>
        </View>

        {/* Cancel Emergency Request — only in en_route */}
        {tripStatus === 'en_route' ? (
          <Pressable onPress={promptCancel} hitSlop={8} className="py-4 mt-2">
            <Text className="text-tada-500 text-base font-semibold text-center">
              Cancel Emergency Request
            </Text>
          </Pressable>
        ) : null}

        {/* First aid help (still useful while waiting) */}
        <Pressable
          onPress={callFirstAid}
          className="bg-white border border-gray-200 rounded-card py-4 mt-3 flex-row items-center justify-center active:bg-gray-50"
        >
          <Text className="text-lg mr-2">🩺</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            First Aid Help
          </Text>
          <Text className="text-gray-500 text-sm ml-2">Talk to a nurse</Text>
        </Pressable>

        {/* Triage section (unchanged from old En Route) */}
        <TriageSection
          status={triageStatus}
          onProvide={provideEmergencyDetails}
          onEdit={editEmergencyDetails}
          onAdd={addEmergencyDetails}
        />

        {/* What's Happening timeline */}
        <View className="bg-white rounded-card p-5 mt-4 shadow-sm">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            What's Happening
          </Text>

          <TimelineRow
            iconBg="bg-green-100"
            iconColor="text-green-600"
            icon="✓"
            title="Ambulance Dispatched"
            subtitle={`Paramedic ${TRIP.driverName} is on the way`}
          />
          <TimelineRow
            iconBg="bg-green-100"
            iconColor="text-green-600"
            icon="✓"
            title="Emergency Contact Notified"
            subtitle={`${TRIP.emergencyContactName} has been alerted`}
          />
          <TimelineRow
            iconBg={tripStatus === 'en_route' ? 'bg-blue-100' : 'bg-green-100'}
            iconColor={
              tripStatus === 'en_route' ? 'text-blue-600' : 'text-green-600'
            }
            icon={tripStatus === 'en_route' ? '〰' : '✓'}
            title="En Route to Pickup"
            subtitle={TRIP.pickupAddress}
            isLast={tripStatus === 'en_route'}
          />
          {tripStatus !== 'en_route' ? (
            <TimelineRow
              iconBg={tripStatus === 'arrived' ? 'bg-blue-100' : 'bg-green-100'}
              iconColor={
                tripStatus === 'arrived' ? 'text-blue-600' : 'text-green-600'
              }
              icon={tripStatus === 'arrived' ? '〰' : '✓'}
              title="Ambulance Arrived"
              subtitle="Paramedic at your location"
              isLast={tripStatus === 'arrived'}
            />
          ) : null}
          {tripStatus === 'to_hospital' ? (
            <TimelineRow
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              icon="〰"
              title="En Route to Hospital"
              subtitle="Patient onboard, being transported"
              isLast
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Map placeholder — Ambulance / You / Hospital pins with a legend.
// Replaced by real react-native-maps integration in Maps Scope C.
// ---------------------------------------------------------------------------

function MapPlaceholder({ tripStatus }: { tripStatus: TripStatus }) {
  // Visual hint: ambulance "moves" relative to You depending on trip status.
  // We don't animate properly here — that's Scope C work — just nudge layout.
  const ambulanceFaded = tripStatus === 'to_hospital' || tripStatus === 'arrived';

  return (
    <View
      style={{
        height: 220,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Faux grid lines for visual texture (matches mockup) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderColor: '#E5E7EB',
          borderWidth: 1,
          borderRadius: 16,
        }}
      />

      {/* Pin row */}
      <View className="flex-1 flex-row items-center justify-around px-4">
        {/* Ambulance pin */}
        <View className="items-center">
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: ambulanceFaded ? '#FCA5A5' : '#E1252C',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>🚑</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded-button mt-1.5 shadow-sm">
            <Text className="text-gray-900 text-xs font-semibold">Ambulance</Text>
          </View>
        </View>

        {/* You pin */}
        <View className="items-center">
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#3B82F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22, color: 'white' }}>📍</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded-button mt-1.5 shadow-sm">
            <Text className="text-gray-900 text-xs font-semibold">You</Text>
          </View>
        </View>

        {/* Hospital pin */}
        <View className="items-center">
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#E1252C',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28, color: 'white' }}>+</Text>
          </View>
          <View className="bg-white px-2 py-1 rounded-button mt-1.5 shadow-sm">
            <Text className="text-gray-900 text-xs font-semibold">Ridge Hospital</Text>
          </View>
        </View>
      </View>

      {/* Legend overlay */}
      <View
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          backgroundColor: 'white',
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 10,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <Text className="text-gray-500 text-[10px] mb-1">Live Tracking</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-tada-500 mr-1" />
          <Text className="text-gray-700 text-[10px] mr-2">Ambulance</Text>
          <View className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
          <Text className="text-gray-700 text-[10px] mr-2">You</Text>
          <View className="w-2 h-2 rounded-full bg-tada-500 mr-1" />
          <Text className="text-gray-700 text-[10px]">Hospital</Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Small inline components
// ---------------------------------------------------------------------------

interface StatBlockProps {
  label: string;
  value: string;
  bg: string;
  valueColor?: string;
}

function StatBlock({ label, value, bg, valueColor }: StatBlockProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
      }}
    >
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text
        style={{
          color: valueColor ?? '#0F172A',
          fontSize: 18,
          fontWeight: '700',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

interface TriageSectionProps {
  status: 'initial' | 'skipped' | 'saved';
  onProvide: () => void;
  onEdit: () => void;
  onAdd: () => void;
}

function TriageSection({
  status,
  onProvide,
  onEdit,
  onAdd,
}: TriageSectionProps) {
  if (status === 'saved') {
    return (
      <View
        style={{
          backgroundColor: '#F0FDF4',
          borderColor: '#22C55E',
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginTop: 16,
        }}
      >
        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center mr-3">
            <Text className="text-white text-sm font-bold">✓</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-base font-bold">
              Emergency Details Shared
            </Text>
            <Text className="text-gray-700 text-sm mt-1">
              The paramedic has been notified of what to expect.
            </Text>
            <Pressable onPress={onEdit} hitSlop={8} className="mt-3">
              <Text className="text-green-700 text-sm font-semibold">
                Edit details →
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (status === 'skipped') {
    return (
      <View className="mt-4">
        <Pressable onPress={onAdd} hitSlop={8} className="py-2">
          <Text className="text-gray-500 text-sm text-center">
            Changed your mind?{' '}
            <Text className="text-tada-500 font-semibold">
              Add emergency details
            </Text>
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#FFF7ED',
        borderColor: '#FB923C',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
      }}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3">
          <Text className="text-white text-sm font-bold">!</Text>
        </View>
        <Text className="text-gray-900 text-base font-bold">
          Help Us Prepare Better
        </Text>
      </View>
      <Text className="text-gray-700 text-sm mb-4">
        Answer a few quick questions to help the paramedic prepare for your
        emergency. This is optional and won't delay the ambulance.
      </Text>
      <Pressable
        onPress={onProvide}
        style={{
          backgroundColor: '#EA580C',
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <View className="flex-row items-center">
          <Text className="text-white text-base mr-2">!</Text>
          <Text className="text-white text-base font-bold">
            Provide Emergency Details
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

interface TimelineRowProps {
  iconBg: string;
  iconColor: string;
  icon: string;
  title: string;
  subtitle: string;
  isLast?: boolean;
}

function TimelineRow({
  iconBg,
  iconColor,
  icon,
  title,
  subtitle,
  isLast,
}: TimelineRowProps) {
  return (
    <View className={`flex-row items-start ${isLast ? '' : 'mb-4'}`}>
      <View
        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${iconBg}`}
      >
        <Text className={`text-base font-bold ${iconColor}`}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-semibold">{title}</Text>
        <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );
}
