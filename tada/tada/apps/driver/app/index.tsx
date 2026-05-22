import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  formatCurrency,
  formatDistance,
  TRIP_STATUS_DRIVER_LABELS,
} from '@tada/shared';

export default function DriverHome() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6">
        <Text className="text-white text-4xl font-bold mb-2">TADA Driver</Text>
        <Text className="text-slate-400 text-base mb-8">Pilot build</Text>

        <View className="bg-slate-800 rounded-card p-5 mb-4">
          <Text className="text-slate-400 text-sm mb-1">Shared package check</Text>
          <Text className="text-white text-xl font-semibold">
            {formatCurrency(54000)} estimated fare
          </Text>
          <Text className="text-slate-500 text-xs mt-1">
            {formatDistance(3500)} to pickup
          </Text>
        </View>

        <View className="bg-slate-800 rounded-card p-5">
          <Text className="text-slate-400 text-sm mb-2">Status label check</Text>
          <Text className="text-white text-sm">
            {TRIP_STATUS_DRIVER_LABELS.en_route_to_pickup}
          </Text>
        </View>

        <Text className="text-slate-500 text-xs mt-8 text-center">
          If you can read this, the driver app is wired up.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
