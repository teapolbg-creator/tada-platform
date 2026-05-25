import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { launchDialer } from '../src/lib/telephony';
import { INCOMING_REQUEST } from '../src/lib/mockData';

/**
 * Arrive & confirm pickup. Shows the patient's safety-critical medical
 * snapshot and a verification step before the trip becomes active. In
 * production the medical fields come from the patient's profile (joined onto
 * the trip) and "Confirm pickup" advances the trip status to patient_onboard.
 */
export default function Pickup() {
  const { patient } = INCOMING_REQUEST;
  const [verified, setVerified] = useState(false);

  function confirmPickup() {
    if (!verified) return;
    router.replace('/navigation?phase=hospital');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6 pb-32">
        <Text className="text-driver-400 text-sm font-semibold mb-1">
          AT PICKUP
        </Text>
        <Text className="text-white text-2xl font-bold mb-6">
          Confirm patient & board
        </Text>

        {/* Patient identity + verify */}
        <View className="bg-slate-800 rounded-card p-5 mb-4">
          <Text className="text-white text-xl font-bold">{patient.name}</Text>
          <Text className="text-slate-400 text-sm mt-0.5">
            {patient.age} years · {patient.gender}
          </Text>
          <Pressable
            onPress={() => setVerified((v) => !v)}
            className="flex-row items-center mt-4"
          >
            <View
              className={`w-6 h-6 rounded-md mr-3 items-center justify-center ${
                verified ? 'bg-driver-500' : 'border-2 border-slate-600'
              }`}
            >
              {verified && <Text className="text-white font-bold">✓</Text>}
            </View>
            <Text className="text-slate-200 text-sm flex-1">
              I have verified this is the correct patient
            </Text>
          </Pressable>
        </View>

        {/* Medical alerts */}
        <Text className="text-slate-400 text-sm mb-2">Medical alerts</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-4 border-l-4 border-status-danger">
          <View className="flex-row mb-3">
            <Text className="text-slate-400 text-sm w-28">Blood type</Text>
            <Text className="text-white text-sm font-semibold">
              {patient.bloodType}
            </Text>
          </View>
          <View className="flex-row mb-3">
            <Text className="text-slate-400 text-sm w-28">Allergies</Text>
            <View className="flex-1 flex-row flex-wrap gap-1.5">
              {patient.allergies.map((a) => (
                <View key={a} className="bg-status-danger/20 rounded-full px-2.5 py-0.5">
                  <Text className="text-red-300 text-xs">{a}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="flex-row">
            <Text className="text-slate-400 text-sm w-28">Conditions</Text>
            <View className="flex-1 flex-row flex-wrap gap-1.5">
              {patient.conditions.map((c) => (
                <View key={c} className="bg-status-progress/20 rounded-full px-2.5 py-0.5">
                  <Text className="text-amber-300 text-xs">{c}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Emergency contact */}
        <Text className="text-slate-400 text-sm mb-2">Emergency contact</Text>
        <View className="bg-slate-800 rounded-card p-5 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-base font-semibold">
              {patient.emergencyContact.name}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {patient.emergencyContact.relation}
            </Text>
          </View>
          <Pressable
            onPress={() => launchDialer(patient.emergencyContact.phone)}
            className="bg-driver-800 rounded-button px-4 py-2.5"
          >
            <Text className="text-driver-100 text-sm font-medium">Call</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Confirm */}
      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-slate-900">
        <View className="px-6 pt-3 pb-3">
          <Pressable
            onPress={confirmPickup}
            disabled={!verified}
            className={`rounded-button py-4 items-center ${
              verified ? 'bg-driver-500' : 'bg-slate-700'
            }`}
          >
            <Text className="text-white font-bold text-base">
              {verified ? 'Confirm Pickup & Start Trip' : 'Verify patient to continue'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
