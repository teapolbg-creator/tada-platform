import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency, GHANA, TRIP_STATUS_LABELS } from '@tada/shared';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-tada-500">
      <ScrollView contentContainerClassName="p-6">
        <Text className="text-white text-4xl font-bold mb-2">TADA</Text>
        <Text className="text-tada-50 text-base mb-8">Patient app — pilot build</Text>

        <View className="bg-white rounded-card p-5 mb-4">
          <Text className="text-gray-600 text-sm mb-1">Shared package check</Text>
          <Text className="text-gray-900 text-xl font-semibold">
            {formatCurrency(30000)} {/* should render "GH₵300.00" */}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            Currency: {GHANA.currencyCode} · Timezone: {GHANA.timezone}
          </Text>
        </View>

        <View className="bg-white rounded-card p-5">
          <Text className="text-gray-600 text-sm mb-2">Status enum check</Text>
          <Text className="text-gray-900 text-sm">
            {TRIP_STATUS_LABELS.en_route_to_pickup}
          </Text>
        </View>

        <Text className="text-tada-100 text-xs mt-8 text-center">
          If you can read this, the app is wired up correctly.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
