import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatPhoneForDisplay } from '@tada/shared';
import { DRIVER, RECENT_RATINGS } from '../src/lib/mockData';

/**
 * Driver profile — certifications, performance metrics, contact details and
 * experience. Pilot reads DRIVER; production loads the `drivers` profile row
 * and lets ops manage certification validity/expiry.
 */
export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6 pb-10">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Text className="text-driver-400 text-2xl">‹</Text>
          </Pressable>
          <Text className="text-white text-2xl font-bold">Profile</Text>
        </View>

        {/* Identity */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-driver-800 items-center justify-center mb-3">
            <Text className="text-driver-200 text-2xl font-bold">
              {DRIVER.fullName.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">{DRIVER.fullName}</Text>
          <Text className="text-slate-400 text-sm mt-0.5">
            {DRIVER.role} · {DRIVER.employeeId}
          </Text>
          <Text className="text-driver-400 text-sm mt-1">
            {DRIVER.rating.toFixed(1)} ★ · {DRIVER.totalTrips.toLocaleString()} trips
          </Text>
        </View>

        {/* Performance metrics */}
        <View className="flex-row gap-3 mb-5">
          <Metric label="Experience" value={`${DRIVER.yearsExperience} yrs`} />
          <Metric label="Trips" value={DRIVER.totalTrips.toLocaleString()} />
          <Metric label="Rating" value={`${DRIVER.rating.toFixed(1)} ★`} />
        </View>

        {/* Assignment */}
        <Text className="text-slate-400 text-sm mb-2">Assignment</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-5">
          <Row label="Ambulance" value={`${DRIVER.ambulance.callSign} · ${DRIVER.ambulance.plate}`} />
          <Row label="Type" value={DRIVER.ambulance.type} />
          <Row label="Base station" value={DRIVER.baseStation} last />
        </View>

        {/* Certifications */}
        <Text className="text-slate-400 text-sm mb-2">Certifications</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-5">
          {DRIVER.certifications.map((c, i) => (
            <View
              key={c.name}
              className={`flex-row items-center ${
                i === DRIVER.certifications.length - 1 ? '' : 'mb-4'
              }`}
            >
              <View
                className={`w-2.5 h-2.5 rounded-full mr-3 ${
                  c.valid ? 'bg-driver-400' : 'bg-status-danger'
                }`}
              />
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">{c.name}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  {c.issuer} · {c.valid ? `valid to ${c.expires}` : `EXPIRED ${c.expires}`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text className="text-slate-400 text-sm mb-2">Contact</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-5">
          <Row label="Phone" value={formatPhoneForDisplay(DRIVER.phone)} />
          <Row label="Email" value={DRIVER.email} last />
        </View>

        {/* Recent ratings */}
        <Text className="text-slate-400 text-sm mb-2">Recent feedback</Text>
        <View className="bg-slate-800 rounded-card p-5 mb-6">
          {RECENT_RATINGS.map((r, i) => (
            <View
              key={i}
              className={i === RECENT_RATINGS.length - 1 ? '' : 'mb-4'}
            >
              <View className="flex-row justify-between">
                <Text className="text-driver-400 text-sm">
                  {'★'.repeat(r.stars)}
                  <Text className="text-slate-600">{'★'.repeat(5 - r.stars)}</Text>
                </Text>
                <Text className="text-slate-500 text-xs">{r.date}</Text>
              </View>
              <Text className="text-slate-300 text-sm mt-1">{r.note}</Text>
            </View>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          onPress={() => router.replace('/login')}
          className="rounded-button py-4 items-center bg-slate-800"
        >
          <Text className="text-status-danger font-semibold">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-slate-800 rounded-card p-4">
      <Text className="text-white text-lg font-bold" numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-slate-400 text-xs mt-1">{label}</Text>
    </View>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={`flex-row ${last ? '' : 'mb-3'}`}>
      <Text className="text-slate-400 text-sm w-28">{label}</Text>
      <Text className="text-white text-sm flex-1">{value}</Text>
    </View>
  );
}
