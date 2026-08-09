import type { Wallet } from "@/types/wallet";

import { api } from "./api";

export const walletService = {
  async getWallet(): Promise<Wallet> {
    const { data } = await api.get<{ data: Wallet }>("/wallet");
    return data.data;
  },
};
