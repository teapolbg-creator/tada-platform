import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { formatDistance } from '@tada/shared';
import { MapPlaceholder } from '../src/components/MapPlaceholder';
import { launchDialer, launchSms } from '../src/lib/telephony';
import {
  INCOMING_REQUEST,
  DESTINATION_HOSPITAL,
  DISPATCH,
  DRIVER,
} from '../src/lib/mockData';

type Phase = 'pickup' | 'hospital';

// Turn-by-turn steps. Production pulls these from a Directions API response
// keyed off live GPS — see BEFORE_LAUNCH.md.
const DIRECTIONS: Record<Phase, { primary: string; then: string }> = {
  pickup: { primary: 'Head north on Independence Ave', then: 'Turn right onto Liberation Rd' },
  hospital: { primary: 'Continue onto Guggisberg Ave', then: 'Korle Bu main entrance on left' },
};

/**
 * Full-screen navigation, used for both legs of the trip:
 *   phase=pickup   → driving to the patient
 *   phase=hospital → driving the patient to hospital
 *
 * The map + route are a placeholder (MapPlaceholder) and the speed readout is
 * simulated. Production wires react-native-maps + expo-location; see
 * BEFORE_LAUNCH.md.
 */
export default function Navigation() {
  const { phase: rawPhase } = useLocalSearchParams<{ phase?: string }>();
  const phase: Phase = rawPhase === 'hospital' ? 'hospital' : 'pickup';

  const dest =
    phase === 'pickup'
      ? {
          label: INCOMING_REQUEST.pickupLabel,
          distance: INCOMING_REQUEST.distanceMeters,
          eta: INCOMING_REQUEST.etaMinutes,
          kind: 'patient' as const,
          callNumber: INCOMING_REQUEST.patient.phone,
        }
      : {
          label: DESTINATION_HOSPITAL.name,
          distance: DESTINATION_HOSPITAL.distanceMeters,
          eta: DESTINATION_HOSPITAL.etaMinutes,
          kind: 'hospital' as const,
          callNumber: DESTINATION_HOSPITAL.phone,
        };

  const steps = DIRECTIONS[phase];

  // Simulated speed readout (km/h). Production reads coords.speed from
  // expo-location's watchPositionAsync.
  const [speed, setSpeed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSpeed(Math.round(38 + Math.random() * 24));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  function arrived() {
    router.replace(phase === 'pickup' ? '/pickup' : '/handover');
  }

  return (
    <View className="flex-1 bg-slate-900">
      <MapPlaceholder
        originLabel={`${DRIVER.ambulance.callSign} · ${DRIVER.baseStation}`}
        destinationLabel={dest.label}
        destinationKind={dest.kind}
      />

      {/* Turn-by-turn banner overlaid at the top */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
        <View className="mx-3 mt-2 bg-driver-600 rounded-card px-4 py-3 flex-row items-center">
          <Text className="text-white text-2xl mr-3">↑</Text>
          <View className="flex-1">
            <Text className="text-white text-base font-semibold" numberOfLines={1}>
              {steps.primary}
            </Text>
            <Text className="text-driver-100 text-xs mt-0.5" numberOfLines={1}>
              Then: {steps.then}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom control sheet */}
      <SafeAreaView edges={['bottom']} className="bg-slate-900">
        <View className="px-5 pt-4">
          {/* Trip facts + speed */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-lg font-bold" numberOfLines={1}>
                {dest.label}
              </Text>
              <Text className="text-slate-400 text-sm mt-0.5">
                {formatDistance(dest.distance)} · {dest.eta} min ·{' '}
                {phase === 'pickup' ? 'to patient' : 'to hospital'}
              </Text>
            </View>
            <View className="items-center bg-slate-800 rounded-card px-3 py-2">
              <Text className="text-white text-xl font-bold">{speed}</Text>
              <Text className="text-slate-400 text-[10px]">km/h</Text>
            </View>
          </View>

          {/* Communication row */}
          <View className="flex-row gap-3 mb-4">
            <CommButton
              label={phase === 'pickup' ? 'Call patient' : 'Call hospital'}
              onPress={() => launchDialer(dest.callNumber)}
            />
            {phase === 'pickup' && (
              <CommButton
                label="Message"
                onPress={() =>
                  launchSms(dest.callNumber, {
                    body: 'TADA paramedic en route to your location.',
                  })
                }
              />
            )}
            <CommButton
              label="Dispatch"
              onPress={() => launchDialer(DISPATCH.phone)}
            />
          </View>

          {/* Arrived */}
          <Pressable
            onPress={arrived}
            className="rounded-button py-4 items-center bg-driver-500 mb-1"
          >
            <Text className="text-white font-bold text-base">
              {phase === 'pickup' ? 'Arrived at Pickup' : 'Arrived at Hospital'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function CommButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-slate-800 rounded-button py-3 items-center"
    >
      <Text className="text-white text-sm font-medium">{label}</Text>
    </Pressable>
  );
}
