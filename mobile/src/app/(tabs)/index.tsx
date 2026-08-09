import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { BitcoinPriceCard } from "@/components/market/BitcoinPriceCard";
import { TradeActionCard } from "@/components/trade/TradeActionCard";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Screen } from "@/components/ui/Screen";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { useAuth } from "@/contexts/auth-context";
import { useBtcPrice } from "@/hooks/use-btc-price";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallet } from "@/hooks/use-wallet";
import { getNameInitials } from "@/utils/getNameInitials";
import { getGreeting } from "@/utils/greeting";
import { useMemo } from "react";

export default function HomeScreen() {
  const { user } = useAuth();
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

  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useTransactions();

  const isLoading = walletLoading || priceLoading || transactionsLoading;
  const error = walletError || priceError || transactionsError;
  const recentTransactions = transactions.slice(0, 3);

  const avatarInitials = useMemo(
    () => getNameInitials(user?.name ?? ""),
    [user?.name],
  );

  return (
    <Screen scroll>
      <View className="mb-6 flex-row items-center justify-between pt-2">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-semibold text-text-primary">
            {getGreeting()}, {user?.name ?? "Trader"}
          </Text>
          <Text className="mt-1 text-sm text-text-secondary">
            Visão geral da sua carteira de Bitcoin
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          onPress={() => router.push("/profile")}
          className="h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10"
        >
          <Text className="text-sm font-semibold text-primary">
            {avatarInitials}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="gap-4">
          <LoadingSkeleton className="h-40" />
          <LoadingSkeleton className="h-36" />
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
            void refreshTransactions();
          }}
        />
      ) : null}

      {!isLoading && !error && wallet && price ? (
        <View className="gap-5">
          <BalanceCard
            totalBalanceBrl={Number(wallet.total_balance_brl)}
            brlBalance={Number(wallet.brl_balance)}
            btcBalance={Number(wallet.btc_balance)}
          />

          <BitcoinPriceCard market={price} />

          <View className="flex-row gap-3">
            <TradeActionCard
              title="Comprar"
              description="Compre BTC com reais"
              icon="arrow-down"
              variant="buy"
              onPress={() => router.push("/trade/buy")}
            />
            <TradeActionCard
              title="Vender"
              description="Converta BTC em reais"
              icon="arrow-up"
              variant="sell"
              onPress={() => router.push("/trade/sell")}
            />
          </View>

          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-text-primary">
                Transações recentes
              </Text>
              <Pressable onPress={() => router.push("/transactions")}>
                <Text className="text-sm font-semibold text-primary">
                  Ver todas as transações
                </Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => router.push(`/transaction/${transaction.id}`)}
                />
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
