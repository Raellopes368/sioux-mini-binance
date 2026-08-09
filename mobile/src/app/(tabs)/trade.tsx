import { router } from "expo-router";
import { Text, View } from "react-native";

import { BitcoinPriceCard } from "@/components/market/BitcoinPriceCard";
import { TradeActionCard } from "@/components/trade/TradeActionCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Screen } from "@/components/ui/Screen";
import { WalletAssetRow } from "@/components/wallet/WalletAssetRow";
import { useBtcPrice } from "@/hooks/use-btc-price";
import { useWallet } from "@/hooks/use-wallet";
import { formatBRL, formatBTC } from "@/utils/currency";

export default function TradeTabScreen() {
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
    refetch: refreshWallet,
  } = useWallet();
  const {
    data: price,
    isLoading: priceLoading,
    error: priceError,
    refetch: refreshPrice,
  } = useBtcPrice();

  const isLoading = walletLoading || priceLoading;
  const error = walletError || priceError;

  return (
    <Screen scroll>
      <Header title="Negociar" subtitle="Compre ou venda Bitcoin na hora" />

      {isLoading ? (
        <View className="gap-4">
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-28" />
          <LoadingSkeleton className="h-28" />
        </View>
      ) : null}

      {!isLoading && error ? (
        <ErrorState
          description={
            error instanceof Error ? error.message : "Erro ao carregar os dados"
          }
          onRetry={() => {
            void refreshWallet();
            void refreshPrice();
          }}
        />
      ) : null}

      {!isLoading && !error && wallet && price ? (
        <View className="gap-5">
          <BitcoinPriceCard market={price} />

          <GlassCard className="p-5">
            <Text className="mb-4 text-base font-semibold text-text-primary">
              Seus saldos
            </Text>
            <View className="gap-3">
              <WalletAssetRow
                label="Saldo em BRL"
                value={formatBRL(Number(wallet.brl_balance))}
              />
              <WalletAssetRow
                label="Saldo em BTC"
                value={formatBTC(Number(wallet.btc_balance))}
              />
            </View>
          </GlassCard>

          <View className="gap-3">
            <TradeActionCard
              title="Comprar Bitcoin"
              description="Use seu saldo em BRL para comprar BTC"
              icon="arrow-down-circle-outline"
              variant="buy"
              onPress={() => router.push("/trade/buy")}
            />
            <TradeActionCard
              title="Vender Bitcoin"
              description="Converta seu BTC em reais"
              icon="arrow-up-circle-outline"
              variant="sell"
              onPress={() => router.push("/trade/sell")}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
