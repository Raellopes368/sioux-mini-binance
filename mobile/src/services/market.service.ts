import type { MarketPrice } from "@/types/market";

import { api } from "./api";

export const marketService = {
  async getBtcPrice(): Promise<MarketPrice> {
    const { data } = await api.get<{ data: MarketPrice }>("/market/btc");
    return data.data;
  },
};
