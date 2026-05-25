import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatDistance } from '@tada/shared';
import { INCOMING_REQUEST } from '../src/lib/mockData';

const COUNTDOWN_SECONDS = 15;

const PRIORITY_STYLE: Record<string, { bg: string; label: string }> = {
  critical: { bg: 'bg-status-danger', label: 'CRITICAL' },
  urgent: { bg: 'bg-status-progress', label: 'URGENT' },
  standard: { bg: 'bg-status-info', label: 'STANDARD' },
};

/**
 * Incoming emergency request — urgent full-screen alert with a 15-second
 * accept window. Pilot uses INCOMING_REQUEST; in production this is driven by
 * a realtime trip assignment and the timer auto-declines back to dispatch so
 * the request can be re-routed to another driver.
 */
export default function Request() {
  const req = INCOMING_REQUEST;
  const priority = PRIORITY_STYLE[req.priority] ?? PRIORITY_STYLE.standard!;
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animated shrinking bar across the full window.
    Animated.timing(progress, {
      toValue: 0,
      duration: COUNTDOWN_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const tick = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(tick);
          // Auto-decline → request goes back to dispatch for re-routing.
          router.back();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [progress]);

  function accept() {
    router.replace('/navigation?phase=pickup');
  }

  function decline() {
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Countdown bar */}
      <View className="h-1.5 bg-slate-800">
        <Animated.View
          className="h-full bg-driver-400"
          style={{
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      <View className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-5">
          <View className={`rounded-full px-3 py-1 ${priority.bg}`}>
            <Text className="text-white text-xs font-bold tracking-wide">
              {priority.label}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center">
            <Text className="text-driver-400 text-lg font-bold">{remaining}</Text>
          </View>
        </View>

        <Text className="text-white text-2xl font-bold mb-1">
          {req.complaint}
        </Text>
        <Text className="text-slate-400 text-sm mb-6">{req.triageNote}</Text>

        {/* Distance / ETA */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-slate-800 rounded-card p-4">
            <Text className="text-white text-xl font-bold">
              {formatDistance(req.distanceMeters)}
            </Text>
            <Text className="text-slate-400 text-xs mt-1">Distance</Text>
          </View>
          <View className="flex-1 bg-slate-800 rounded-card p-4">
            <Text className="text-white text-xl font-bold">{req.etaMinutes} min</Text>
            <Text className="text-slate-400 text-xs mt-1">ETA to pickup</Text>
          </View>
        </View>

        {/* Pickup */}
        <View className="bg-slate-800 rounded-card p-4 mb-3">
          <Text className="text-slate-400 text-xs mb-1">Pickup</Text>
          <Text className="text-white text-base font-semibold">
            {req.pickupLabel}
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5">{req.pickupArea}</Text>
        </View>

        {/* Patient preview */}
        <View className="bg-slate-800 rounded-card p-4">
          <Text className="text-slate-400 text-xs mb-1">Patient</Text>
          <Text className="text-white text-base font-semibold">
            {req.patient.name} · {req.patient.age} · {req.patient.gender}
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            Full medical details after you accept
          </Text>
        </View>
      </View>

      {/* Accept / Decline */}
      <View className="px-6 pb-4 flex-row gap-3">
        <Pressable
          onPress={decline}
          className="flex-1 rounded-button py-4 items-center bg-slate-800"
        >
          <Text className="text-slate-300 font-semibold">Decline</Text>
        </Pressable>
        <Pressable
          onPress={accept}
          className="flex-[2] rounded-button py-4 items-center bg-driver-500"
        >
          <Text className="text-white font-bold text-base">Accept</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
