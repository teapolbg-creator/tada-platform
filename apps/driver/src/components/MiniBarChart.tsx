import { View, Text } from 'react-native';

/**
 * Lightweight bar chart built from plain Views — no charting dependency.
 * Each bar's height is proportional to the largest value in the set.
 */
export function MiniBarChart({
  data,
  highlightIndex,
}: {
  data: { label: string; value: number }[];
  /** Optional bar to highlight (e.g. the current day). */
  highlightIndex?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View className="flex-row items-end justify-between h-32 gap-2">
      {data.map((d, i) => {
        // Floor empty bars at a thin sliver so the axis stays legible.
        const heightPct = d.value === 0 ? 2 : Math.max(6, (d.value / max) * 100);
        const isHot = i === highlightIndex;
        return (
          <View key={d.label} className="flex-1 items-center">
            <View className="flex-1 w-full justify-end">
              <View
                className={`w-full rounded-t-md ${isHot ? 'bg-driver-400' : 'bg-driver-800'}`}
                style={{ height: `${heightPct}%` }}
              />
            </View>
            <Text className={`text-[10px] mt-1.5 ${isHot ? 'text-driver-400' : 'text-slate-500'}`}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
