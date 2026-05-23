import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------
// All values below are hardcoded for now. They become real queries to
// Supabase / the user's profile in later modules.

const USER = {
  fullName: 'Kofi Mensah',
  phone: '+233 24 123 4567',
};

const STATS = {
  nearbyAmbulances: 12,
  avgResponseMinutes: '3-5',
};

const HAS_UNREAD_NOTIFICATIONS = true;

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pulse animation for the EMERGENCY button halo. Two concentric radiating
  // rings, each slowly scaling and fading. Loops forever, paused while the
  // drawer is open to reduce cognitive load.
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (drawerOpen) return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [drawerOpen, pulse]);

  // Android hardware back: close drawer first; if closed, exit the route.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (drawerOpen) {
        setDrawerOpen(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [drawerOpen]);

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.2, 0],
  });

  function handleEmergencyPress() {
    router.push('/request');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => setDrawerOpen(true)}
            hitSlop={12}
            className="mr-4"
          >
            <Text className="text-2xl">☰</Text>
          </Pressable>
          <View>
            <Text className="text-gray-900 text-xl font-bold">TADA</Text>
            <Text className="text-gray-500 text-xs">Emergency Ready</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={12}
            className="mr-5"
          >
            <View>
              <Text className="text-2xl">🔔</Text>
              {HAS_UNREAD_NOTIFICATIONS ? (
                <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-tada-500 rounded-full" />
              ) : null}
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/profile')} hitSlop={12}>
            <Text className="text-2xl">👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerClassName="px-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency card */}
        <View className="bg-white rounded-card p-6 items-center mt-2 shadow-sm">
          <Text className="text-gray-900 text-2xl font-bold text-center mt-2">
            Need Emergency Help?
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2 mb-6">
            Tap the button below to request an ambulance
          </Text>

          <View className="items-center justify-center my-4 h-72 w-72">
            <Animated.View
              style={{
                position: 'absolute',
                width: 280,
                height: 280,
                borderRadius: 140,
                backgroundColor: '#FFC9CB',
                transform: [{ scale: haloScale }],
                opacity: haloOpacity,
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                width: 240,
                height: 240,
                borderRadius: 120,
                backgroundColor: '#FF9CA0',
                transform: [{ scale: haloScale }],
                opacity: haloOpacity,
              }}
            />
            <Pressable
              onPress={handleEmergencyPress}
              className="w-56 h-56 rounded-full bg-tada-500 active:bg-tada-600 items-center justify-center shadow-lg"
            >
              <Text className="text-6xl mb-2">🚑</Text>
              <Text className="text-white text-2xl font-bold tracking-wide">
                EMERGENCY
              </Text>
              <Text className="text-tada-50 text-sm mt-1">Request Ambulance</Text>
            </Pressable>
          </View>

          <Text className="text-gray-500 text-xs text-center mt-4">
            Your location will be automatically detected
          </Text>
        </View>

        {/* Stat cards */}
        <View className="flex-row mt-4">
          <View className="flex-1 bg-white rounded-card p-4 mr-2 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-button bg-green-100 items-center justify-center mr-3">
                <Text className="text-xl">🚑</Text>
              </View>
              <View>
                <Text className="text-gray-900 text-2xl font-bold">
                  {STATS.nearbyAmbulances}
                </Text>
                <Text className="text-gray-500 text-xs">Nearby Ambulances</Text>
              </View>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-card p-4 ml-2 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-button bg-blue-100 items-center justify-center mr-3">
                <Text className="text-xl">⏰</Text>
              </View>
              <View>
                <Text className="text-gray-900 text-2xl font-bold">
                  {STATS.avgResponseMinutes}
                </Text>
                <Text className="text-gray-500 text-xs">Avg. Response (min)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location access placeholder */}
        <View className="bg-blue-50 rounded-card p-4 mt-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-xl mr-2">📍</Text>
            <Text className="text-blue-900 text-base font-semibold">
              Location Access
            </Text>
          </View>
          <Text className="text-blue-900 text-sm mb-3">
            A live map will appear here showing your location and ambulances
            online near you.
          </Text>
          <View className="h-32 rounded-button bg-blue-100 items-center justify-center">
            <Text className="text-blue-500 text-xs">
              Live map — wires up in the Maps module
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Drawer overlay */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href:
    | '/profile'
    | '/trips'
    | '/emergency-contacts'
    | '/medical-profile'
    | '/payment-methods'
    | '/settings';
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'My Profile', href: '/profile' },
  { label: 'Trip History', href: '/trips' },
  { label: 'Emergency Contacts', href: '/emergency-contacts' },
  { label: 'Medical Profile', href: '/medical-profile' },
  { label: 'Payment Methods', href: '/payment-methods' },
  { label: 'Settings', href: '/settings' },
];

function Drawer({ open, onClose }: DrawerProps) {
  const translate = useRef(new Animated.Value(open ? 0 : -320)).current;
  const fade = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: open ? 0 : -320,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: open ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, translate, fade]);

  function handleNavigate(href: MenuItem['href']) {
    onClose();
    router.push(href);
  }

  function handleLogout() {
    onClose();
    // Real sign-out wires up with auth. For now we go back to the role picker.
    router.replace('/');
  }

  return (
    <View
      pointerEvents={open ? 'auto' : 'none'}
      className="absolute inset-0"
      style={{ zIndex: 10 }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: fade,
        }}
      >
        <Pressable onPress={onClose} className="flex-1" />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 300,
          backgroundColor: 'white',
          transform: [{ translateX: translate }],
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 4, height: 0 },
          elevation: 10,
        }}
      >
        <SafeAreaView className="flex-1">
          <ScrollView contentContainerClassName="p-6">
            <View className="items-start mb-8">
              <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-3">
                <Text className="text-3xl">👤</Text>
              </View>
              <Text className="text-gray-900 text-xl font-bold">
                {USER.fullName}
              </Text>
              <Text className="text-gray-500 text-sm">{USER.phone}</Text>
            </View>

            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.href}
                onPress={() => handleNavigate(item.href)}
                className="py-4"
              >
                <Text className="text-gray-900 text-base">{item.label}</Text>
              </Pressable>
            ))}

            <Pressable onPress={handleLogout} className="py-4 mt-2">
              <Text className="text-tada-500 text-base font-semibold">
                Logout
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
