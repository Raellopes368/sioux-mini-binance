import { router } from "expo-router";
import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Transaction } from "@/types/transaction";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

import { TransactionItem } from "./TransactionItem";

/** Matches floating tab bar height in `(tabs)/_layout`. */
const FLOATING_TAB_BAR_HEIGHT = 64;

type TransactionListProps = {
  transactions: Transaction[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEndReached?: () => void;
  ListHeaderComponent?: ReactElement | null;
};

export function TransactionList({
  transactions,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  error = null,
  onRetry,
  onEndReached,
  ListHeaderComponent,
}: TransactionListProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = FLOATING_TAB_BAR_HEIGHT + insets.bottom + 16;

  if (isLoading) {
    return (
      <View className="gap-3">
        {ListHeaderComponent}
        <LoadingSkeleton className="h-20" />
        <LoadingSkeleton className="h-20" />
        <LoadingSkeleton className="h-20" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="gap-3">
        {ListHeaderComponent}
        <ErrorState description={error} onRetry={onRetry} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1"
      data={transactions}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="grow gap-3"
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <EmptyState
          title="Nenhuma transação ainda"
          description="Seu histórico de compras e vendas aparecerá aqui."
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="items-center py-4">
            <ActivityIndicator />
          </View>
        ) : null
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          onEndReached?.();
        }
      }}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <TransactionItem
          transaction={item}
          onPress={() => router.push(`/transaction/${item.id}`)}
        />
      )}
    />
  );
}
