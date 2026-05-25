import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { launchDialer } from '../src/lib/telephony';
import {
  DESTINATION_HOSPITAL,
  INCOMING_REQUEST,
} from '../src/lib/mockData';

/**
 * Arrive at hospital & hand over. Confirms the hospital was pre-notified
 * (so the ER team is ready), shows a trip summary, and completes the trip.
 *
 * Pilot: the pre-notification "sent" state is faked on a timer. Production
 * fires a real notification to the hospital app when the trip enters
 * en_route_to_hospital, and "Complete handover" sets status=completed.
 */
export default function Handover() {
  const [notified, setNotified] = useState(false);
  const { patient, complaint } = INCOMING_REQUEST;

  useEffect(() => {
    const t = setTimeout(() => setNotified(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function complete() {
    router.replace('/dashboard');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6 pb-32">
        <Text className="text-driver-400 text-sm font-semibold mb-1">
          AT HOSPITAL
        </Text>
        <Text className="text-white text-2xl font-bold mb-6">
          Patient handover
        </Text>

        {/* Pre-notification status */}
        <View
          className={`rounded-card p-5 mb-4 flex-row items-center ${
            notified ? 'bg-driver-900' : 'bg-slate-800'
          }`}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              notified ? 'bg-driver-500' : 'bg-slate-700'
            }`}
          >
            <Text className="text-white font-bold">{notified ? '✓' : '…'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-semibold">
              {notified ? 'Hospital pre-notified' : 'Notifying hospital…'}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {DESTINATION_HOSPITAL.name} · {DESTINATION_HOSPITAL.department}
            </Text>
          </View>
        </View>

        {/* Trip summary */}
        <Text className="text-slate-400 text-sm mb-2">Handover summary</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-4">
          <Row label="Patient" value={`${patient.name} · ${patient.age} · ${patient.gender}`} />
          <Row label="Complaint" value={complaint} />
          <Row label="Blood type" value={patient.bloodType} />
          <Row label="Allergies" value={patient.allergies.join(', ')} />
          <Row label="Conditions" value={patient.conditions.join(', ')} last />
        </View>

        <Pressable
          onPress={() => launchDialer(DESTINATION_HOSPITAL.phone)}
          className="bg-slate-800 rounded-button py-3.5 items-center"
        >
          <Text className="text-driver-100 text-sm font-medium">
            Call {DESTINATION_HOSPITAL.name} ER
          </Text>
        </Pressable>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-slate-900">
        <View className="px-6 pt-3 pb-3">
          <Pressable
            onPress={complete}
            className="rounded-button py-4 items-center bg-driver-500"
          >
            <Text className="text-white font-bold text-base">
              Complete Handover
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={`flex-row ${last ? '' : 'mb-3'}`}>
      <Text className="text-slate-400 text-sm w-28">{label}</Text>
      <Text className="text-white text-sm flex-1">{value}</Text>
    </View>
  );
}
