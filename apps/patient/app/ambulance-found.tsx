import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { launchDialer, PILOT_PLACEHOLDER_NUMBERS } from '../src/lib/telephony';

// Timing: dialer opens at 1.5s, then 2 more seconds before navigating onward.
const DIAL_AT_MS = 1500;
const NAVIGATE_AT_MS = 3500;

// Placeholder driver data. In production this is the assigned driver's
// profile from the drivers table, threaded through trip params.
const DRIVER = {
  name: 'Kwame Asante',
  role: 'Paramedic',
  rating: 4.9,
  etaMinutes: 3,
  distanceKm: 1.2,
  // Replaced with the driver's real registered phone number once dispatch
  // is wired up. See src/lib/telephony.ts for the production replacement.
  phone: PILOT_PLACEHOLDER_NUMBERS.paramedic,
};

export default function AmbulanceFound() {
  const checkScale = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check icon springs in
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Card slides up and fades in slightly delayed
    Animated.parallel([
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 400,
        delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-launch the dialer with the paramedic's number. The Ambulance Found
    // screen stays underneath; when the user dismisses the dialer or finishes
    // the call, they're back here. Navigation to /tracking still happens on
    // its own schedule below.
    const dialTimer = setTimeout(() => {
      launchDialer(DRIVER.phone);
    }, DIAL_AT_MS);

    // After the hold, navigate to the Tracking screen (replaces the old
    // En Route screen). Auto-dial happens at 1.5s; navigation happens at 3.5s.
    const navTimer = setTimeout(
      () => router.replace('/tracking'),
      NAVIGATE_AT_MS
    );

    return () => {
      clearTimeout(dialTimer);
      clearTimeout(navTimer);
    };
  }, [checkScale, cardSlide, cardFade]);

  // Disable hardware back — driver has accepted, can't be canceled by going back.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      {/* Center column with a max width so it stays compact on wide web viewports */}
      <View className="flex-1 items-center px-6 pt-16">
        <View className="w-full" style={{ maxWidth: 420 }}>
          {/* Animated checkmark */}
          <View className="items-center mb-6">
            <Animated.View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: checkScale }],
                shadowColor: '#22C55E',
                shadowOpacity: 0.3,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 56,
                  fontWeight: 'bold',
                  lineHeight: 64,
                  textAlign: 'center',
                }}
              >
                ✓
              </Text>
            </Animated.View>
          </View>

          <Text className="text-gray-900 text-3xl font-bold text-center">
            Ambulance Found!
          </Text>
          <Text className="text-gray-500 text-base text-center mt-2 mb-8">
            Help is on the way
          </Text>

          {/* Driver card — all styles inline so Animated.View + NativeWind don't conflict on web */}
          <Animated.View
            style={{
              opacity: cardFade,
              transform: [{ translateY: cardSlide }],
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            {/* Driver identity row */}
            <View className="flex-row items-center mb-4">
              <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-4">
                <Text className="text-2xl">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold">
                  {DRIVER.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-gray-500 text-sm">
                    {DRIVER.role} ·{' '}
                  </Text>
                  <Text className="text-gray-900 text-sm font-semibold">
                    {DRIVER.rating}
                  </Text>
                  <Text className="text-sm ml-1">⭐</Text>
                </View>
              </View>
            </View>

            {/* ETA + Distance row */}
            <View className="flex-row">
              <View className="flex-1 bg-gray-50 rounded-button p-4 mr-2 items-center">
                <Text className="text-tada-500 text-3xl font-bold">
                  {DRIVER.etaMinutes}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Minutes Away</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-button p-4 ml-2 items-center">
                <Text className="text-blue-600 text-3xl font-bold">
                  {DRIVER.distanceKm}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">km Distance</Text>
              </View>
            </View>
          </Animated.View>

          <Text className="text-gray-500 text-sm text-center mt-6">
            You will receive an automated call with instructions...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
