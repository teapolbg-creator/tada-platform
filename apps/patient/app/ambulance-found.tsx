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

const HOLD_DURATION_MS = 2500;

// Placeholder driver data. In production this is the assigned driver's
// profile from the drivers table, threaded through trip params.
const DRIVER = {
  name: 'Kwame Asante',
  role: 'Paramedic',
  rating: 4.9,
  etaMinutes: 3,
  distanceKm: 1.2,
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

    // After the hold, navigate to the call screen (hybrid: in-app UI now,
    // real Hubtel Voice call wired in a later module via triggerOutboundCall)
    const t = setTimeout(() => router.replace('/call'), HOLD_DURATION_MS);
    return () => clearTimeout(t);
  }, [checkScale, cardSlide, cardFade]);

  // Disable hardware back — driver has accepted, can't be canceled by going back.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <View className="flex-1 px-6 justify-center">
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
            <Text className="text-white text-5xl font-bold">✓</Text>
          </Animated.View>
        </View>

        <Text className="text-gray-900 text-3xl font-bold text-center">
          Ambulance Found!
        </Text>
        <Text className="text-gray-500 text-base text-center mt-2 mb-8">
          Help is on the way
        </Text>

        {/* Driver card */}
        <Animated.View
          style={{
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }}
          className="bg-white rounded-card p-5 shadow-sm"
        >
          {/* Driver identity */}
          <View className="flex-row items-center mb-4">
            <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-4">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                {DRIVER.name}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-gray-500 text-sm">{DRIVER.role} · </Text>
                <Text className="text-gray-900 text-sm font-semibold">
                  {DRIVER.rating}
                </Text>
                <Text className="text-sm ml-1">⭐</Text>
              </View>
            </View>
          </View>

          {/* Distance + ETA */}
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
    </SafeAreaView>
  );
}
