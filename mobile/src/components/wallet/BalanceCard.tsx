import { Text, View } from "react-native";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatBRL, formatBTC } from "@/utils/currency";

import { WalletAssetRow } from "./WalletAssetRow";

type BalanceCardProps = {
  totalBalanceBrl: number;
  brlBalance: number;
  btcBalance: number;
};

export function BalanceCard({
  totalBalanceBrl,
  brlBalance,
  btcBalance,
}: BalanceCardProps) {
  return (
    <GlassCard className="p-5">
      <Text className="text-sm font-medium text-text-secondary">
        Saldo total
      </Text>
      <Text className="mt-2 text-3xl font-semibold text-text-primary">
        {formatBRL(totalBalanceBrl || 0)}
      </Text>

      <View className="mt-5 gap-3 border-t border-white/10 pt-5">
        <WalletAssetRow label="BRL" value={formatBRL(brlBalance || 0)} />
        <WalletAssetRow label="Bitcoin" value={formatBTC(btcBalance || 0)} />
      </View>
    </GlassCard>
  );
}
