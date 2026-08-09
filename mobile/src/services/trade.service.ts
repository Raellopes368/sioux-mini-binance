import type { TradeRequest, TradeResult, TradeSide } from "@/types/trade";
import type { Transaction } from "@/types/transaction";

import { api } from "./api";

function toTradeResult(side: TradeSide, transaction: Transaction): TradeResult {
  return {
    transactionId: String(transaction.id),
    side,
    brlAmount: Number(transaction.brl_amount),
    btcAmount: Number(transaction.btc_amount),
    btcPrice: Number(transaction.btc_price),
  };
}

export const tradeService = {
  async buy(request: TradeRequest): Promise<TradeResult> {
    const { data } = await api.post<{ data: Transaction }>("/trade/buy", {
      amount: request.amount,
      expected_price: String(request.expectedPrice),
    });

    return toTradeResult("buy", data.data);
  },

  async sell(request: TradeRequest): Promise<TradeResult> {
    const { data } = await api.post<{ data: Transaction }>("/trade/sell", {
      amount: request.amount,
      expected_price: String(request.expectedPrice),
    });

    return toTradeResult("sell", data.data);
  },
};
