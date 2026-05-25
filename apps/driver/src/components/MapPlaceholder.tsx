import { View, Text } from 'react-native';

/**
 * Placeholder for the full-screen navigation map.
 *
 * ====================================================================
 * REPLACE BEFORE PRODUCTION — see BEFORE_LAUNCH.md
 * ====================================================================
 * The real screen needs the Google Maps SDK (react-native-maps) with an API
 * key, live `expo-location` updates, a Directions API route polyline, and
 * pickup/hospital markers. This component fakes the visual so the rest of the
 * driver flow can be built and demoed without map keys.
 * ====================================================================
 */
export function MapPlaceholder({
  originLabel,
  destinationLabel,
  destinationKind,
}: {
  originLabel: string;
  destinationLabel: string;
  destinationKind: 'patient' | 'hospital';
}) {
  return (
    <View className="flex-1 bg-slate-800 overflow-hidden">
      {/* Faux map grid */}
      <View className="absolute inset-0 opacity-40">
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`h${i}`}
            className="absolute left-0 right-0 border-t border-slate-700"
            style={{ top: `${(i + 1) * 11}%` }}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`v${i}`}
            className="absolute top-0 bottom-0 border-l border-slate-700"
            style={{ left: `${(i + 1) * 15}%` }}
          />
        ))}
      </View>

      {/* Faux route line */}
      <View
        className="absolute h-1.5 bg-driver-400 rounded-full"
        style={{ top: '38%', left: '18%', right: '22%', transform: [{ rotate: '14deg' }] }}
      />

      {/* Origin marker (driver) */}
      <View className="absolute" style={{ top: '52%', left: '16%' }}>
        <View className="w-5 h-5 rounded-full bg-driver-500 border-2 border-white" />
        <View className="bg-slate-900/80 rounded-md px-2 py-0.5 mt-1">
          <Text className="text-white text-[10px]">You</Text>
        </View>
      </View>

      {/* Destination marker */}
      <View className="absolute" style={{ top: '30%', right: '20%' }}>
        <View
          className={`w-5 h-5 rounded-full border-2 border-white ${
            destinationKind === 'patient' ? 'bg-tada-500' : 'bg-status-info'
          }`}
        />
        <View className="bg-slate-900/80 rounded-md px-2 py-0.5 mt-1">
          <Text className="text-white text-[10px]">
            {destinationKind === 'patient' ? 'Patient' : 'Hospital'}
          </Text>
        </View>
      </View>

      {/* Honest pilot-mode badge */}
      <View className="absolute top-3 self-center bg-slate-900/80 rounded-full px-3 py-1">
        <Text className="text-slate-300 text-[11px]">
          Map preview · live navigation in production
        </Text>
      </View>

      {/* From → To footer chip */}
      <View className="absolute bottom-3 left-3 right-3 bg-slate-900/85 rounded-card px-4 py-2.5 flex-row items-center">
        <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
          {originLabel}
        </Text>
        <Text className="text-driver-400 mx-2">→</Text>
        <Text className="text-white text-xs font-semibold flex-1 text-right" numberOfLines={1}>
          {destinationLabel}
        </Text>
      </View>
    </View>
  );
}
