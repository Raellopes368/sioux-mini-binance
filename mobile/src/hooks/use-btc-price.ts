import { useQuery } from "@tanstack/react-query";

import { marketService } from "@/services/market.service";
import type { MarketPrice } from "@/types/market";

const REFRESH_INTERVAL = 30 * 1000;

export function useBtcPrice() {
  return useQuery<MarketPrice>({
    queryKey: ["btc-price"],
    queryFn: marketService.getBtcPrice,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}
