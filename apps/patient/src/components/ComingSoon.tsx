import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface ComingSoonProps {
  title: string;
}

/**
 * Standard "Coming soon" screen used by all the drawer destination routes
 * until each one gets its own implementation. Provides a back button so the
 * user isn't stuck.
 */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-row items-center">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-4">
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-gray-900 text-xl font-bold">{title}</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🚧</Text>
        <Text className="text-gray-900 text-xl font-semibold mb-2">
          Coming soon
        </Text>
        <Text className="text-gray-500 text-sm text-center">
          This screen will be built in a future module.
        </Text>
      </View>
    </SafeAreaView>
  );
}
