import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatCurrency } from '@tada/shared';
import { MiniBarChart } from '../src/components/MiniBarChart';
import {
  STATS,
  WEEKLY_BREAKDOWN,
  PAYMENT_SCHEDULE,
  DRIVER,
  type EarningsPeriod,
} from '../src/lib/mockData';

const PERIODS: EarningsPeriod[] = ['day', 'week', 'month'];

/**
 * Performance & earnings. Pilot reads from mock STATS; production aggregates
 * the driver's `trips` and `payments` rows over each period — see
 * BEFORE_LAUNCH.md.
 */
export default function Earnings() {
  const [period, setPeriod] = useState<EarningsPeriod>('week');
  const stats = STATS[period];
  // Today is Sunday in the mock data; highlight it in the weekly chart.
  const todayIndex = WEEKLY_BREAKDOWN.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6 pb-10">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Text className="text-driver-400 text-2xl">‹</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Earnings</Text>
        </View>

        {/* Period selector */}
        <View className="flex-row bg-slate-800 rounded-button p-1 mb-5">
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              className={`flex-1 rounded-md py-2 items-center ${
                period === p ? 'bg-driver-500' : ''
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  period === p ? 'text-white' : 'text-slate-400'
                }`}
              >
                {STATS[p].label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Headline earnings */}
        <View className="bg-driver-900 rounded-card p-5 mb-4">
          <Text className="text-driver-200 text-sm">{stats.label} earnings</Text>
          <Text className="text-white text-4xl font-black mt-1">
            {formatCurrency(stats.earningsPesewas)}
          </Text>
          <View className="flex-row mt-4 gap-6">
            <View>
              <Text className="text-white text-lg font-bold">{stats.trips}</Text>
              <Text className="text-driver-200 text-xs">Trips</Text>
            </View>
            <View>
              <Text className="text-white text-lg font-bold">
                {stats.hoursOnline}h
              </Text>
              <Text className="text-driver-200 text-xs">Online</Text>
            </View>
            <View>
              <Text className="text-white text-lg font-bold">
                {formatCurrency(
                  Math.round(stats.earningsPesewas / Math.max(1, stats.trips)),
                  { withSymbol: false }
                )}
              </Text>
              <Text className="text-driver-200 text-xs">Avg / trip</Text>
            </View>
          </View>
        </View>

        {/* Weekly chart */}
        <View className="bg-slate-800 rounded-card p-5 mb-4">
          <Text className="text-slate-400 text-sm mb-4">This week</Text>
          <MiniBarChart
            data={WEEKLY_BREAKDOWN.map((d) => ({
              label: d.day,
              value: d.earningsPesewas,
            }))}
            highlightIndex={todayIndex}
          />
        </View>

        {/* Payment schedule */}
        <Text className="text-slate-400 text-sm mb-2">Payment schedule</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-sm">Pending payout</Text>
            <Text className="text-white text-sm font-semibold">
              {formatCurrency(PAYMENT_SCHEDULE.pendingPesewas)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-sm">Next payout</Text>
            <Text className="text-white text-sm font-semibold">
              {PAYMENT_SCHEDULE.nextPayoutDate}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-sm">Method</Text>
            <Text className="text-white text-sm font-semibold">
              {PAYMENT_SCHEDULE.method}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View className="bg-slate-800 rounded-card p-5 flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-sm">Your rating</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Across {DRIVER.totalTrips.toLocaleString()} trips
            </Text>
          </View>
          <Text className="text-driver-400 text-3xl font-black">
            {DRIVER.rating.toFixed(1)}
            <Text className="text-driver-400 text-lg"> ★</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
