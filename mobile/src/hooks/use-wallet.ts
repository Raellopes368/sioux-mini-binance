import { walletService } from "@/services/wallet.service";
import type { Wallet } from "@/types/wallet";
import { useQuery } from "@tanstack/react-query";

const REFRESH_INTERVAL = 60 * 1000; // 1 minute

export function useWallet() {
  return useQuery<Wallet, Error>({
    queryKey: ["wallet"],
    queryFn: walletService.getWallet,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}
