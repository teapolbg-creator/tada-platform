import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatCurrency } from '@tada/shared';
import { DRIVER, STATS } from '../src/lib/mockData';

/**
 * Driver home / dashboard.
 *
 * The Online/Offline toggle is local state for the pilot. In production it
 * writes the driver's `status` to Supabase ('available' | 'offline') and the
 * dispatcher's fleet view + the matching algorithm read from it; requests are
 * only routed to drivers whose status is 'available'.
 */
export default function Dashboard() {
  const [online, setOnline] = useState(false);
  const today = STATS.day;

  function handleDemoRequest() {
    // Demo-only entry point. Real requests arrive over a realtime channel
    // from dispatch when the driver is online — see BEFORE_LAUNCH.md.
    router.push('/request');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6 pb-10">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-slate-400 text-sm">Welcome back</Text>
            <Text className="text-white text-2xl font-bold">{DRIVER.fullName}</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {DRIVER.ambulance.callSign} · {DRIVER.role}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/profile')}
            className="w-12 h-12 rounded-full bg-driver-800 items-center justify-center"
          >
            <Text className="text-driver-200 font-bold text-lg">
              {DRIVER.fullName.split(' ').map((n) => n[0]).join('')}
            </Text>
          </Pressable>
        </View>

        {/* Online / Offline toggle */}
        <View
          className={`rounded-card p-5 mb-5 ${online ? 'bg-driver-900' : 'bg-slate-800'}`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className={`w-3 h-3 rounded-full mr-2.5 ${
                  online ? 'bg-driver-400' : 'bg-slate-500'
                }`}
              />
              <View>
                <Text className="text-white text-lg font-semibold">
                  {online ? "You're Online" : "You're Offline"}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {online
                    ? 'Receiving emergency requests'
                    : 'Go online to receive requests'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setOnline((v) => !v)}
              className={`w-16 h-9 rounded-full px-1 justify-center ${
                online ? 'bg-driver-500 items-end' : 'bg-slate-600 items-start'
              }`}
            >
              <View className="w-7 h-7 rounded-full bg-white" />
            </Pressable>
          </View>
        </View>

        {/* Today summary */}
        <Text className="text-slate-400 text-sm mb-3">{today.label}</Text>
        <View className="flex-row gap-3 mb-5">
          <Stat label="Trips" value={`${today.trips}`} />
          <Stat label="Earnings" value={formatCurrency(today.earningsPesewas)} />
          <Stat label="Hours" value={`${today.hoursOnline}`} />
        </View>

        {/* Quick links */}
        <View className="flex-row gap-3 mb-6">
          <LinkCard
            label="Earnings"
            sub="Stats & payouts"
            onPress={() => router.push('/earnings')}
          />
          <LinkCard
            label="Profile"
            sub="Certs & rating"
            onPress={() => router.push('/profile')}
          />
        </View>

        {/* Demo request trigger */}
        <Pressable
          onPress={handleDemoRequest}
          disabled={!online}
          className={`rounded-button py-4 items-center ${
            online ? 'bg-driver-500' : 'bg-slate-700'
          }`}
        >
          <Text className="text-white font-semibold">
            {online ? 'Simulate Incoming Request' : 'Go online to receive requests'}
          </Text>
        </Pressable>
        <Text className="text-slate-500 text-xs text-center mt-3">
          Demo button · production requests arrive automatically from dispatch
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-slate-800 rounded-card p-4">
      <Text className="text-white text-xl font-bold" numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-slate-400 text-xs mt-1">{label}</Text>
    </View>
  );
}

function LinkCard({
  label,
  sub,
  onPress,
}: {
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 bg-slate-800 rounded-card p-4">
      <Text className="text-white text-base font-semibold">{label}</Text>
      <Text className="text-slate-400 text-xs mt-0.5">{sub}</Text>
    </Pressable>
  );
}
