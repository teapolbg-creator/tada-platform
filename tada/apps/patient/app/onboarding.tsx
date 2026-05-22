import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type Slide = {
  icon: string;
  iconBg: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: '🚑',
    iconBg: 'bg-tada-500',
    title: 'Emergency Ambulance at Your Fingertips',
    body: 'Request the nearest ambulance with just one tap. Fast, reliable, and always available.',
  },
  {
    icon: '⏰',
    iconBg: 'bg-blue-500',
    title: 'Rapid Response Time',
    body: 'Our system instantly connects you with the closest available ambulance for immediate assistance.',
  },
  {
    icon: '📍',
    iconBg: 'bg-green-500',
    title: 'Real-Time Tracking',
    body: 'Track your ambulance in real-time and know exactly when help will arrive.',
  },
  {
    icon: '🛡️',
    iconBg: 'bg-purple-500',
    title: 'Safe & Secure',
    body: 'All our drivers are verified professionals. Your safety is our top priority.',
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    if (isLast) {
      router.replace('/login');
    } else {
      setIndex(index + 1);
    }
  }

  function skip() {
    router.replace('/login');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-6 pt-4">
        <Pressable onPress={skip} hitSlop={12}>
          <Text className="text-gray-500 text-base">Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="flex-grow px-8 items-center justify-center"
        showsVerticalScrollIndicator={false}
      >
        <View className={`w-28 h-28 rounded-full items-center justify-center mb-10 ${slide.iconBg}`}>
          <Text className="text-5xl">{slide.icon}</Text>
        </View>
        <Text className="text-gray-900 text-2xl font-bold text-center mb-3">
          {slide.title}
        </Text>
        <Text className="text-gray-500 text-base text-center leading-6">
          {slide.body}
        </Text>
      </ScrollView>

      <View className="px-6 pb-8">
        <View className="flex-row justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === index ? 'w-6 bg-tada-500' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </View>

        <Pressable
          onPress={next}
          className="bg-tada-500 active:bg-tada-600 rounded-button py-4 items-center"
        >
          <Text className="text-white text-base font-semibold">
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
