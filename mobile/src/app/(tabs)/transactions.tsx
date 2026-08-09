import { View } from "react-native";

import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { useTransactions } from "@/hooks/use-transactions";

export default function TransactionsScreen() {
  const {
    transactions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    filter,
    setFilter,
    fetchNextPage,
    refresh,
  } = useTransactions();

  return (
    <Screen padded={false} className="px-5">
      <Header title="Transações" subtitle="Seu histórico de negociações" />
      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        error={error}
        onRetry={refresh}
        onEndReached={fetchNextPage}
        ListHeaderComponent={
          <View>
            <TransactionFilters value={filter} onChange={setFilter} />
          </View>
        }
      />
    </Screen>
  );
}
