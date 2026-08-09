import { Text, View } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';

type SummaryRow = {
  label: string;
  value: string;
};

type TradeSummaryProps = {
  rows: SummaryRow[];
};

export function TradeSummary({ rows }: TradeSummaryProps) {
  return (
    <GlassCard className="p-5">
      <Text className="mb-4 text-base font-semibold text-text-primary">
        Resumo da ordem
      </Text>
      <View className="gap-3">
        {rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-center justify-between">
            <Text className="text-sm text-text-secondary">{row.label}</Text>
            <Text className="text-sm font-medium text-text-primary">
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}
