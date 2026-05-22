import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type Role = {
  key: 'patient' | 'driver' | 'operator' | 'hospital';
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  enabled: boolean;
};

const ROLES: Role[] = [
  {
    key: 'patient',
    title: 'Patient',
    description: 'Request emergency ambulance',
    icon: '👤',
    iconBg: 'bg-blue-500',
    enabled: true,
  },
  {
    key: 'driver',
    title: 'Ambulance Driver',
    description: 'Accept and respond to emergencies',
    icon: '🚑',
    iconBg: 'bg-green-500',
    enabled: false,
  },
  {
    key: 'operator',
    title: 'Dispatch Operator',
    description: 'Coordinate emergency response',
    icon: '🎧',
    iconBg: 'bg-purple-500',
    enabled: false,
  },
  {
    key: 'hospital',
    title: 'Hospital Admin',
    description: 'Manage incoming patients',
    icon: '🏥',
    iconBg: 'bg-tada-500',
    enabled: false,
  },
];

function notifyComingSoon(role: string) {
  const message = `${role} prototype is coming soon.`;
  if (Platform.OS === 'web') {
    window.alert(message);
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
    notifyComingSoon(role.title);
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
                  role.enabled ? 'active:opacity-80' : 'opacity-90'
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
