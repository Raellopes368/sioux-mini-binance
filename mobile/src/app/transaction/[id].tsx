import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { TransactionDetailRow } from "@/components/transactions/TransactionDetailRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Screen } from "@/components/ui/Screen";
import { transactionsService } from "@/services/transactions.service";
import type { Transaction } from "@/types/transaction";
import { formatBRL, formatBTC } from "@/utils/currency";
import { formatFullDate, formatTime } from "@/utils/date";
import { formatTransactionType } from "@/utils/transaction-labels";

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) {
      setError("Transação não encontrada");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsService.getById(id);
      setTransaction(data);
      if (!data) {
        setError("Transação não encontrada");
      }
    } catch {
      setError("Não foi possível carregar a transação");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  return (
    <Screen scroll>
      <Header title="Detalhes da transação" showBack />

      {isLoading ? (
        <View className="gap-3">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-64" />
        </View>
      ) : null}

      {!isLoading && error ? (
        <ErrorState description={error} onRetry={() => void load()} />
      ) : null}

      {!isLoading && !error && !transaction ? (
        <EmptyState
          title="Transação não encontrada"
          description="Esta transação pode não estar mais disponível."
          icon="search-outline"
        />
      ) : null}

      {!isLoading && transaction ? (
        <GlassCard className="px-5">
          <View className="border-b border-white/10 py-5">
            <Text className="text-sm text-text-secondary">
              Tipo de transação
            </Text>
            <Text className="mt-1 text-2xl font-semibold uppercase text-text-primary">
              {formatTransactionType(transaction.type)}
            </Text>
          </View>

          <TransactionDetailRow
            label="Quantidade de BTC"
            value={formatBTC(Number(transaction.btc_amount))}
          />
          <TransactionDetailRow
            label="Valor em BRL"
            value={formatBRL(Number(transaction.brl_amount))}
          />
          <TransactionDetailRow
            label="Preço do BTC"
            value={formatBRL(Number(transaction.btc_price))}
          />
          <TransactionDetailRow
            label="Data"
            value={formatFullDate(transaction.created_at)}
          />
          <TransactionDetailRow
            label="Horário"
            value={formatTime(transaction.created_at)}
          />
          <TransactionDetailRow
            label="ID da transação"
            value={`#${transaction.id}`}
          />
        </GlassCard>
      ) : null}
    </Screen>
  );
}
