import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { GlassCard } from "@/components/ui/GlassCard";
import { colors } from "@/constants/colors";
import type { MarketPrice } from "@/types/market";
import { formatBRL, formatPercent } from "@/utils/currency";

type BitcoinPriceCardProps = {
  market: MarketPrice;
};

export function BitcoinPriceCard({ market }: BitcoinPriceCardProps) {
  const isPositive = market.changePercent24h >= 0;

  return (
    <GlassCard className="p-5" intensity={48}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-bitcoin/15">
            <Ionicons name="logo-bitcoin" size={26} color={colors.bitcoin} />
          </View>
          <View>
            <Text className="text-lg font-semibold text-text-primary">
              Bitcoin
            </Text>
            <Text className="text-sm text-text-secondary">{market.symbol}</Text>
          </View>
        </View>
        <View
          className={[
            "rounded-full px-3 py-1.5",
            isPositive ? "bg-primary-soft" : "bg-error/15",
          ].join(" ")}
        >
          <Text
            className={[
              "text-sm font-semibold",
              isPositive ? "text-primary" : "text-error",
            ].join(" ")}
          >
            {formatPercent(market.changePercent24h)}
          </Text>
        </View>
      </View>

      <Text className="mt-5 text-3xl font-semibold text-text-primary">
        {formatBRL(Number(market.price))}
      </Text>
    </GlassCard>
  );
}
