import { useEffect, useRef, useState } from 'react';
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

// Timing for the search simulation. Real dispatch lands in the matching module.
const TOTAL_DURATION_MS = 4500;
const STAGE_2_AT_MS = 1500;
const STAGE_3_AT_MS = 3500;
const FINAL_DELAY_MS = 500;

export default function Searching() {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth progress bar 0 → 100 over the full duration
    Animated.timing(progress, {
      toValue: 1,
      duration: TOTAL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width interpolation needs JS driver
    }).start();

    // Pulse the ambulance icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Stage transitions
    const t1 = setTimeout(() => setStage(2), STAGE_2_AT_MS);
    const t2 = setTimeout(() => setStage(3), STAGE_3_AT_MS);
    const t3 = setTimeout(() => setStage(4), TOTAL_DURATION_MS);
    const t4 = setTimeout(
      () => router.replace('/ambulance-found'),
      TOTAL_DURATION_MS + FINAL_DELAY_MS
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      pulseLoop.stop();
    };
  }, [progress, pulse]);

  // Disable the hardware back button — searching is non-cancellable for now.
  // A "cancel search" affordance can come later; we don't want a panicking
  // user to accidentally back out of an emergency search.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressPercent = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const [percentText, setPercentText] = useState('0% complete');
  useEffect(() => {
    const id = progressPercent.addListener(({ value }) => {
      setPercentText(`${Math.round(value)}% complete`);
    });
    return () => progressPercent.removeListener(id);
  }, [progressPercent]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <SafeAreaView className="flex-1 bg-tada-50">
      <View className="flex-1 px-6 justify-center">
        {/* Priority badge */}
        <View className="items-center mb-6">
          <View className="bg-tada-500 rounded-button px-6 py-2.5 shadow-lg">
            <Text className="text-white text-sm font-bold tracking-wider">
              CRITICAL PRIORITY
            </Text>
          </View>
        </View>

        {/* Pulsing ambulance icon with halo */}
        <View className="items-center mb-8">
          <View className="w-44 h-44 items-center justify-center">
            <View
              className="absolute w-44 h-44 rounded-full bg-tada-100"
              style={{ opacity: 0.6 }}
            />
            <Animated.View
              style={{
                width: 144,
                height: 144,
                borderRadius: 72,
                backgroundColor: '#E1252C',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pulseScale }],
              }}
            >
              <Text className="text-6xl">🚑</Text>
            </Animated.View>
          </View>
        </View>

        {/* Status text */}
        <Text className="text-gray-900 text-3xl font-bold text-center">
          Finding Nearest Ambulance...
        </Text>
        <Text className="text-gray-500 text-base text-center mt-3 mb-8">
          Dispatching emergency response immediately
        </Text>

        {/* Progress bar */}
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            style={{
              height: '100%',
              width: progressWidth,
              backgroundColor: '#E1252C',
              borderRadius: 999,
            }}
          />
        </View>
        <Text className="text-gray-500 text-sm text-center mt-3 mb-8">
          {percentText}
        </Text>

        {/* Stage checklist */}
        <View className="self-center">
          <ChecklistRow done={true} label="Location confirmed" />
          <ChecklistRow
            done={stage >= 2}
            label="Emergency contact notified"
          />
          <ChecklistRow
            done={stage >= 4}
            inProgress={stage === 3}
            label={
              stage >= 4 ? 'Ambulance assigned' : 'Searching ambulances...'
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

interface ChecklistRowProps {
  done: boolean;
  inProgress?: boolean;
  label: string;
}

function ChecklistRow({ done, inProgress, label }: ChecklistRowProps) {
  const dotColor = done
    ? 'bg-green-500'
    : inProgress
      ? 'bg-tada-500'
      : 'bg-gray-300';
  const textColor = done || inProgress ? 'text-gray-900' : 'text-gray-400';

  return (
    <View className="flex-row items-center py-2">
      <View className={`w-2.5 h-2.5 rounded-full mr-3 ${dotColor}`} />
      <Text className={`text-base ${textColor}`}>{label}</Text>
    </View>
  );
}
