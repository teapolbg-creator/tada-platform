import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------
// Pickup address is hardcoded for now. Once Google Maps + reverse geocoding
// is wired up (Maps module), this comes from the user's actual GPS location.
const PICKUP = {
  street: 'Independence Avenue, Ridge',
  city: 'Accra, Ghana',
};

export default function Request() {
  // Track whether we're about to leave so we don't double-prompt
  const [confirmingExit, setConfirmingExit] = useState(false);

  function promptCancel() {
    if (confirmingExit) return;
    setConfirmingExit(true);

    const onConfirm = () => {
      setConfirmingExit(false);
      router.back();
    };
    const onDismiss = () => setConfirmingExit(false);

    if (Platform.OS === 'web') {
      // Web: use the browser's confirm dialog. It's synchronous so we can
      // just check the return value.
      const ok =
        typeof globalThis !== 'undefined' &&
        (globalThis as { confirm?: (msg: string) => boolean }).confirm?.(
          'Are you sure you want to cancel your emergency request?'
        );
      if (ok) {
        onConfirm();
      } else {
        onDismiss();
      }
      return;
    }

    Alert.alert(
      'Cancel emergency request?',
      'Are you sure you want to cancel? An ambulance has not been requested yet.',
      [
        { text: 'No, stay', style: 'cancel', onPress: onDismiss },
        { text: 'Yes, cancel', style: 'destructive', onPress: onConfirm },
      ],
      { onDismiss }
    );
  }

  // Intercept Android hardware back the same way as the back arrow.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      promptCancel();
      return true; // we've handled the back press
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChangeLocation() {
    // Wires up to a location picker in the Maps module. For now a no-op
    // with a friendly note.
    if (Platform.OS === 'web') {
      const w = globalThis as { alert?: (msg: string) => void };
      w.alert?.('Location picker arrives in the Maps module.');
    } else {
      Alert.alert('Coming soon', 'Location picker arrives in the Maps module.');
    }
  }

  function handleRequestAmbulance() {
    // Real telephony, trip creation, dispatch — all land in later modules.
    // For now we navigate forward through the demo flow.
    router.push('/searching');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <Pressable onPress={promptCancel} hitSlop={12} className="mr-4">
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-gray-900 text-xl font-bold">Emergency Request</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Pickup location card */}
        <View className="bg-white rounded-card p-4 border-2 border-tada-100 shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 flex-row">
              <Text className="text-xl mr-3 mt-0.5">📍</Text>
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-bold">
                  Pickup Location
                </Text>
                <Text className="text-gray-900 text-sm mt-1">
                  {PICKUP.street}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">{PICKUP.city}</Text>
              </View>
            </View>
            <Pressable onPress={handleChangeLocation} hitSlop={8}>
              <Text className="text-tada-500 text-sm font-bold">Change</Text>
            </Pressable>
          </View>
        </View>

        {/* Big red request button */}
        <Pressable
          onPress={handleRequestAmbulance}
          className="bg-tada-500 active:bg-tada-600 rounded-card py-5 mt-5 items-center shadow-lg"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">🚨</Text>
            <Text className="text-white text-lg font-bold tracking-wide">
              REQUEST AMBULANCE NOW
            </Text>
          </View>
        </Pressable>

        <Text className="text-gray-500 text-sm text-center mt-4">
          Emergency contact will be notified automatically
        </Text>

        {/* Map placeholder — same approach as the Home screen's Location Access */}
        <View className="bg-gray-100 rounded-card mt-6 h-64 items-center justify-center">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-2">
            <Text className="text-3xl">📍</Text>
          </View>
          <Text className="text-gray-500 text-xs">
            Live map — wires up in the Maps module
          </Text>
        </View>
        <View className="bg-white rounded-button px-3 py-1.5 self-start -mt-56 ml-4 shadow-sm">
          <Text className="text-gray-700 text-xs">📍 Your Location</Text>
        </View>

        {/* Spacer so the "Your Location" pill doesn't overlap subsequent content */}
        <View className="h-48" />
      </ScrollView>
    </SafeAreaView>
  );
}
