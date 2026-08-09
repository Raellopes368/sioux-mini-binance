import type {
  Transaction,
  TransactionResponse,
  TransactionType,
} from "@/types/transaction";

import { api } from "./api";

export const transactionsService = {
  async list(
    filter: TransactionType | "ALL" = "ALL",
    page = 1,
  ): Promise<TransactionResponse> {
    const { data } = await api.get<TransactionResponse>("/transactions", {
      params: {
        type: filter === "ALL" ? undefined : filter,
        page,
      },
    });
    return data;
  },

  async getById(id: string): Promise<Transaction | null> {
    const { data } = await api.get<{ data: Transaction }>(
      `/transactions/${id}`,
    );
    return data.data;
  },
};
