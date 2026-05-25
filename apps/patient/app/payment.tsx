import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatCurrency, sumPesewas } from '@tada/shared';

// ---------------------------------------------------------------------------
// Payment screen (mockup #4)
//
// Real money never gets charged here yet. This is the demo flow:
//   1. Patient sees trip fare + service fee + total
//   2. Selects Mobile Money or Cash
//   3. Taps Continue → 2s "Processing payment..." → green check → /trip-completed
//
// REPLACE BEFORE PRODUCTION (added to BEFORE_LAUNCH.md):
//   • Module 5 wires the real trip; the fare values come from the trip's
//     base_fare_pesewas / distance_fare_pesewas / time_fare_pesewas columns
//     (computed by Postgres functions on trip completion).
//   • Module 10 replaces the simulated Processing with a Hubtel MoMo STK push
//     (Mobile Money path) or a "Confirm received" affordance for the driver
//     to mark the cash payment as collected (Cash path).
// ---------------------------------------------------------------------------

// ---- Placeholder trip context --------------------------------------------
// Hardcoded here for the demo. In Module 5 these come from the trip record.

// Pricing for Tema Metropolitan zone (matches pricing_zones row in migration 008):
//   - Base fare: GH₵300.00 (30,000 pesewas)
//   - Distance:  GH₵20/km (2,000 pesewas/km)
//   - Time:      GH₵2/min (200 pesewas/min)
//   - Service fee: GH₵5 platform fee (TODO: confirm if charged or absorbed)
const TRIP = {
  distanceKm: 1.2,
  durationMinutes: 12,
  baseFarePesewas: 30_000,
  distanceRatePesewasPerKm: 2_000,
  timeRatePesewasPerMinute: 200,
  serviceFeePesewas: 500,
};

// Compute the trip fare from the constants. Real implementation will pull
// the precomputed total_fare_pesewas value off the trip record.
const tripFarePesewas = sumPesewas(
  TRIP.baseFarePesewas,
  Math.round(TRIP.distanceKm * TRIP.distanceRatePesewasPerKm),
  Math.round(TRIP.durationMinutes * TRIP.timeRatePesewasPerMinute)
);

const totalPesewas = sumPesewas(tripFarePesewas, TRIP.serviceFeePesewas);

// ---- Payment method type -------------------------------------------------

type PaymentMethod = 'momo' | 'cash';

// ---- Screen --------------------------------------------------------------

export default function Payment() {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Once payment is "confirmed", navigate to the trip-completed screen after
  // a brief moment for the user to see the success state.
  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => {
      router.replace('/trip-completed');
    }, 900);
    return () => clearTimeout(t);
  }, [confirmed]);

  function handleContinue() {
    if (!selected || processing || confirmed) return;
    setProcessing(true);
    // TODO Module 10: replace this simulated delay with a real call to
    //   POST /functions/v1/initiate-payment
    // which kicks off either:
    //   - Hubtel MoMo STK push (returns provider_transaction_id, awaits webhook)
    //   - Cash collection acknowledgment (marks payment as pending_cash)
    setTimeout(() => {
      setProcessing(false);
      setConfirmed(true);
    }, 2000);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="mr-4"
          disabled={processing || confirmed}
        >
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-gray-900 text-xl font-bold">Payment</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 py-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Trip summary card */}
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 18,
            padding: 20,
          }}
        >
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Trip Summary
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700 text-base">Trip fare</Text>
            <Text className="text-gray-900 text-base font-semibold">
              {formatCurrency(tripFarePesewas)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-700 text-base">Service fee</Text>
            <Text className="text-gray-900 text-base font-semibold">
              {formatCurrency(TRIP.serviceFeePesewas)}
            </Text>
          </View>

          <View className="h-px bg-gray-200 mb-4" />

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-900 text-lg font-bold">Total</Text>
            <Text className="text-tada-500 text-2xl font-bold">
              {formatCurrency(totalPesewas)}
            </Text>
          </View>
        </View>

        {/* Section heading */}
        <Text className="text-gray-900 text-lg font-bold mt-6 mb-3">
          Select Payment Method
        </Text>

        {/* Mobile Money */}
        <PaymentMethodCard
          selected={selected === 'momo'}
          onPress={() => setSelected('momo')}
          disabled={processing || confirmed}
          iconBg="#F3E8FF"
          iconColor="#9333EA"
          icon="📱"
          title="Mobile Money"
          subtitle="MTN, Vodafone, AirtelTigo"
        />

        <View style={{ height: 12 }} />

        {/* Cash */}
        <PaymentMethodCard
          selected={selected === 'cash'}
          onPress={() => setSelected('cash')}
          disabled={processing || confirmed}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          icon="👛"
          title="Cash"
          subtitle="Pay the driver directly"
        />

        {/* Continue / processing / confirmed states */}
        {!selected ? (
          <View
            style={{
              backgroundColor: '#EFF6FF',
              borderColor: '#BFDBFE',
              borderWidth: 1,
              borderRadius: 14,
              padding: 16,
              marginTop: 18,
              alignItems: 'center',
            }}
          >
            <Text className="text-blue-900 text-sm">
              Please select a payment method above to continue
            </Text>
          </View>
        ) : confirmed ? (
          <View
            style={{
              backgroundColor: '#DCFCE7',
              borderColor: '#22C55E',
              borderWidth: 1,
              borderRadius: 14,
              padding: 16,
              marginTop: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text className="text-green-700 text-lg mr-2">✓</Text>
            <Text className="text-green-700 text-base font-bold">
              {selected === 'momo' ? 'Payment confirmed' : 'Payment recorded'}
            </Text>
          </View>
        ) : processing ? (
          <View
            className="bg-tada-500 rounded-card py-4 mt-5 flex-row items-center justify-center"
          >
            <ActivityIndicator color="white" />
            <Text className="text-white text-base font-bold ml-3">
              {selected === 'momo'
                ? 'Processing payment...'
                : 'Recording payment...'}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={handleContinue}
            className="bg-tada-500 active:bg-tada-600 rounded-card py-4 mt-5 items-center shadow-lg"
          >
            <Text className="text-white text-base font-bold">
              {selected === 'momo'
                ? `Pay ${formatCurrency(totalPesewas)} with Mobile Money`
                : `Confirm Cash Payment of ${formatCurrency(totalPesewas)}`}
            </Text>
          </Pressable>
        )}

        {/* Payment Security note */}
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 14,
            padding: 16,
            marginTop: 18,
          }}
        >
          <View className="flex-row items-start">
            <Text className="text-base mr-2">💡</Text>
            <View className="flex-1">
              <Text className="text-blue-900 text-sm">
                <Text className="font-bold">Payment Security: </Text>
                <Text>
                  Your payment information is encrypted and secure. For mobile
                  money, you'll receive a prompt on your phone to authorize
                  the payment.
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Payment method card ------------------------------------------------

interface PaymentMethodCardProps {
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  iconBg: string;
  iconColor: string;
  icon: string;
  title: string;
  subtitle: string;
}

function PaymentMethodCard({
  selected,
  onPress,
  disabled,
  iconBg,
  iconColor,
  icon,
  title,
  subtitle,
}: PaymentMethodCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: selected ? '#E1252C' : '#E5E7EB',
        backgroundColor: selected ? '#FEF2F2' : 'white',
        borderRadius: 14,
        padding: 14,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 22, color: iconColor }}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-bold">{title}</Text>
        <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>
      </View>
      {selected ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#E1252C',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
        >
          <Text className="text-white text-sm font-bold">✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
