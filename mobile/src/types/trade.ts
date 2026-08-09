export type TradeSide = "buy" | "sell";

export type TradeRequest = {
  amount: number;
  expectedPrice: number | string;
};

export type TradeResult = {
  transactionId: string;
  side: TradeSide;
  brlAmount: number;
  btcAmount: number;
  btcPrice: number;
};
