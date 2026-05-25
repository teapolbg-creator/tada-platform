import { Alert, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Each non-patient role lives in its own app. In dev these run on fixed local
// ports; for a hosted demo, point them at deployed URLs via env vars. Set a var
// to an empty string to mark that app "coming soon" again.
const APP_URLS = {
  driver: process.env.EXPO_PUBLIC_DRIVER_URL ?? 'http://localhost:8082',
  operator: process.env.EXPO_PUBLIC_OPERATOR_URL ?? 'http://localhost:3001',
  hospital: process.env.EXPO_PUBLIC_HOSPITAL_URL ?? 'http://localhost:3002',
};

type Role = {
  key: 'patient' | 'driver' | 'operator' | 'hospital';
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  // The patient flow is in-app; the others open their own app via this URL.
  href?: string;
};

const ROLES: Role[] = [
  {
    key: 'patient',
    title: 'Patient',
    description: 'Request emergency ambulance',
    icon: '👤',
    iconBg: 'bg-blue-500',
  },
  {
    key: 'driver',
    title: 'Ambulance Driver',
    description: 'Accept and respond to emergencies',
    icon: '🚑',
    iconBg: 'bg-green-500',
    href: APP_URLS.driver,
  },
  {
    key: 'operator',
    title: 'Dispatch Operator',
    description: 'Coordinate emergency response',
    icon: '🎧',
    iconBg: 'bg-purple-500',
    href: APP_URLS.operator,
  },
  {
    key: 'hospital',
    title: 'Hospital Admin',
    description: 'Manage incoming patients',
    icon: '🏥',
    iconBg: 'bg-tada-500',
    href: APP_URLS.hospital,
  },
];

// A role is launchable if it's the in-app patient flow or has a non-empty URL.
function isAvailable(role: Role) {
  return role.key === 'patient' || !!role.href;
}

function notifyComingSoon(role: string) {
  const message = `${role} prototype is coming soon.`;
  if (Platform.OS === 'web') {
    // window is defined on web; React Native's types don't include it.
    (globalThis as { alert?: (msg: string) => void }).alert?.(message);
  } else {
    Alert.alert('Coming soon', message);
  }
}

export default function Home() {
  function selectRole(role: Role) {
    if (role.key === 'patient') {
      router.push('/splash');
      return;
    }
    if (!role.href) {
      notifyComingSoon(role.title);
      return;
    }
    if (Platform.OS === 'web') {
      // Navigate the current tab. window.open(_, '_blank') from a Pressable
      // handler runs a tick after the raw click, so browsers treat it as
      // programmatic and the popup blocker kills it — location.assign never is.
      (globalThis as { location?: { assign: (url: string) => void } }).location?.assign(
        role.href
      );
    } else {
      Linking.openURL(role.href);
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FDF7F7' }}>
      <ScrollView contentContainerClassName="flex-grow px-6 py-10 items-center justify-center">
        <View className="w-20 h-20 rounded-3xl bg-tada-500 items-center justify-center mb-6 shadow-lg">
          <Text className="text-4xl">🚑</Text>
        </View>

        <Text className="text-gray-900 text-5xl font-bold tracking-tight">TADA</Text>
        <Text className="text-gray-700 text-base mt-2">Te-Apo Ambulance Dispatch App</Text>
        <Text className="text-gray-400 text-sm mt-1 mb-10">
          Emergency Response Platform for Ghana
        </Text>

        <View className="w-full max-w-3xl flex-row flex-wrap -mx-2">
          {ROLES.map((role) => (
            <View key={role.key} className="w-full md:w-1/2 px-2 mb-4">
              <Pressable
                onPress={() => selectRole(role)}
                className={`flex-row items-center bg-white rounded-card p-5 shadow-sm ${
                  isAvailable(role) ? 'active:opacity-80' : 'opacity-90'
                }`}
              >
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${role.iconBg}`}
                >
                  <Text className="text-2xl">{role.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-lg font-semibold">{role.title}</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">{role.description}</Text>
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <Text className="text-gray-500 text-sm mt-8 text-center">
          Select your role to view the prototype
        </Text>
        <Text className="text-gray-400 text-xs mt-1 text-center">
          Fully interactive demo with realistic data
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
