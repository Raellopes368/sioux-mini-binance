import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";

import { transactionsService } from "@/services/transactions.service";
import type { Transaction, TransactionType } from "@/types/transaction";

export type TransactionFilter = TransactionType | "ALL";

type UseTransactionsResult = {
  transactions: Transaction[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: string | null;
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  fetchNextPage: () => void;
  refresh: () => Promise<void>;
};

export function useTransactions(
  initialFilter: TransactionFilter = "ALL",
): UseTransactionsResult {
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);

  const query = useInfiniteQuery({
    queryKey: ["transactions", filter],
    queryFn: ({ pageParam }) => transactionsService.list(filter, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  return {
    transactions: query.data?.pages.flatMap((page) => page.data) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    error: query.isError ? "Não foi possível carregar as transações" : null,
    filter,
    setFilter,
    fetchNextPage: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    refresh: async () => {
      await query.refetch();
    },
  };
}
