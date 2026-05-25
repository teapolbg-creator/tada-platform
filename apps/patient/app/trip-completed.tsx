import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatCurrency, sumPesewas } from '@tada/shared';

// ---------------------------------------------------------------------------
// Trip Completed screen (mockup #5)
//
// Shown after the patient pays. Recaps the trip and gives them two paths:
//   - Submit Rating → /rate (1-5 stars + optional comment)
//   - Back to Home → /home (skip rating, end the loop)
//
// REPLACE BEFORE PRODUCTION:
//   Module 5 — TRIP_SUMMARY comes from a real trips row, pulled in via
//   the tripId carried in URL params from the payment screen. Pickup +
//   destination addresses come from the trip's pickup_address / destination
//   columns. Duration is computed from started_at / completed_at timestamps.
//   Total fare is the trip's total_fare_pesewas value.
// ---------------------------------------------------------------------------

// Placeholder trip data. Same values used by Tracking + Payment screens.
const TRIP_SUMMARY = {
  pickupAddress: 'Independence Avenue, Ridge',
  destinationAddress: 'Ridge Hospital, Accra',
  durationMinutes: 12,
  // Same calculation as Payment screen:
  //   Base GH₵300 + (1.2 km × GH₵20) + (12 min × GH₵2) + GH₵5 service fee
  totalFarePesewas: sumPesewas(30_000, 1.2 * 2_000, 12 * 200, 500),
};

export default function TripCompleted() {
  function submitRating() {
    router.push('/rate');
  }

  function backToHome() {
    router.replace('/home');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-gray-900 text-xl font-bold">Trip Summary</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 py-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Green hero card */}
        <View
          style={{
            backgroundColor: '#22C55E',
            borderRadius: 18,
            paddingVertical: 32,
            paddingHorizontal: 20,
            alignItems: 'center',
            shadowColor: '#22C55E',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 40,
                fontWeight: 'bold',
                lineHeight: 44,
              }}
            >
              ✓
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">Trip Completed</Text>
          <Text className="text-white/90 text-sm mt-2 text-center">
            You've arrived safely at your destination
          </Text>
        </View>

        {/* Trip Details card */}
        <View className="bg-white rounded-card p-5 mt-5 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Trip Details
          </Text>

          <DetailRow
            icon="📍"
            iconColor="#22C55E"
            label="Pickup"
            value={TRIP_SUMMARY.pickupAddress}
          />
          <DetailRow
            icon="📍"
            iconColor="#E1252C"
            label="Destination"
            value={TRIP_SUMMARY.destinationAddress}
          />
          <DetailRow
            icon="🕐"
            iconColor="#3B82F6"
            label="Duration"
            value={`${TRIP_SUMMARY.durationMinutes} minutes`}
          />
          <DetailRow
            icon="💲"
            iconColor="#16A34A"
            label="Total Fare"
            value={formatCurrency(TRIP_SUMMARY.totalFarePesewas)}
            isLast
          />
        </View>

        {/* Submit Rating button */}
        <Pressable
          onPress={submitRating}
          className="bg-tada-500 active:bg-tada-600 rounded-card py-4 mt-6 items-center shadow-lg"
        >
          <Text className="text-white text-base font-bold">Submit Rating</Text>
        </Pressable>

        {/* Back to Home button */}
        <Pressable
          onPress={backToHome}
          className="bg-gray-100 active:bg-gray-200 rounded-card py-4 mt-3 flex-row items-center justify-center"
        >
          <Text className="text-lg mr-2">🏠</Text>
          <Text className="text-gray-900 text-base font-bold">Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Detail row -----------------------------------------------------------

interface DetailRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  isLast?: boolean;
}

function DetailRow({ icon, iconColor, label, value, isLast }: DetailRowProps) {
  return (
    <View className={`flex-row items-start ${isLast ? '' : 'mb-4'}`}>
      <Text style={{ fontSize: 18, marginRight: 12, color: iconColor }}>
        {icon}
      </Text>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs">{label}</Text>
        <Text className="text-gray-900 text-base font-semibold mt-0.5">
          {value}
        </Text>
      </View>
    </View>
  );
}
