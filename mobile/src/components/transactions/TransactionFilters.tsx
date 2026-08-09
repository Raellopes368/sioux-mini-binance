import { Pressable, Text, View } from "react-native";

import type { TransactionFilter } from "@/hooks/use-transactions";

const FILTERS: { key: TransactionFilter; label: string }[] = [
  { key: "ALL", label: "Todas" },
  { key: "BUY", label: "Compra" },
  { key: "SELL", label: "Venda" },
];

type TransactionFiltersProps = {
  value: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
};

export function TransactionFilters({
  value,
  onChange,
}: TransactionFiltersProps) {
  return (
    <View className="mb-4 flex-row gap-2">
      {FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            onPress={() => onChange(filter.key)}
            className={[
              "min-h-11 flex-1 items-center justify-center rounded-2xl border px-3",
              active
                ? "border-primary bg-primary-soft"
                : "border-white/15 bg-white/10",
            ].join(" ")}
          >
            <Text
              className={[
                "text-sm font-semibold",
                active ? "text-primary" : "text-text-secondary",
              ].join(" ")}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
