import type { TransactionStatus, TransactionType } from '@/types/transaction';

export function formatTransactionType(type: TransactionType): string {
  return type === 'BUY' ? 'Compra' : 'Venda';
}

export function formatTransactionStatus(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    completed: 'Concluída',
    pending: 'Pendente',
    failed: 'Falhou',
  };
  return labels[status];
}
