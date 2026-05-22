import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/onboarding'), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 bg-tada-500 items-center justify-center px-6">
      <View className="w-24 h-24 rounded-3xl bg-white items-center justify-center mb-6 shadow-lg">
        <Text className="text-5xl">🚑</Text>
      </View>
      <Text className="text-white text-5xl font-bold tracking-tight">TADA</Text>
      <Text className="text-white text-lg mt-2">Emergency Ambulance</Text>
      <Text className="text-tada-50 text-sm mt-1">Help is on the way</Text>

      <View className="flex-row mt-12 gap-2">
        <View className="w-2 h-2 rounded-full bg-white opacity-100" />
        <View className="w-2 h-2 rounded-full bg-white opacity-60" />
        <View className="w-2 h-2 rounded-full bg-white opacity-30" />
      </View>
    </View>
  );
}
