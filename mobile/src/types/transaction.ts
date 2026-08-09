export type TransactionType = "BUY" | "SELL";

export type TransactionStatus = "completed" | "pending" | "failed";

export type Transaction = {
  id: number;
  type: TransactionType;
  btc_amount: string;
  brl_amount: string;
  btc_price: string;
  created_at: string;
};

export type TransactionMeta = {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
};

export type TransactionLinks = {
  first: string;
  last: string;
  prev: string;
  next: string;
};

export type TransactionResponse = {
  data: Transaction[];
  links: TransactionLinks;
  meta: TransactionMeta;
};
