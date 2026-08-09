import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors } from '@/constants/colors';
import type { Transaction } from '@/types/transaction';
import { formatBRL, formatBTC } from '@/utils/currency';
import { formatTransactionDate } from '@/utils/date';
import { formatTransactionType } from '@/utils/transaction-labels';

type TransactionItemProps = {
  transaction: Transaction;
  onPress: () => void;
};

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isBuy = transaction.type === 'BUY';

  return (
    <GlassCard
      className="flex-row items-center px-4 py-4"
      intensity={28}
      onPress={onPress}>
      <View
        className={[
          'mr-3 h-12 w-12 items-center justify-center rounded-full',
          isBuy ? 'bg-primary-soft' : 'bg-error/15',
        ].join(' ')}>
        <Ionicons
          name={isBuy ? 'arrow-down' : 'arrow-up'}
          size={20}
          color={isBuy ? colors.primary : colors.error}
        />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold uppercase text-text-primary">
          {formatTransactionType(transaction.type)}
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          {formatTransactionDate(transaction.created_at)}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={[
            'text-base font-semibold',
            isBuy ? 'text-primary' : 'text-error',
          ].join(' ')}>
          {isBuy ? '+' : '-'}
          {formatBTC(Number(transaction.btc_amount))}
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          {isBuy ? '-' : '+'}
          {formatBRL(Number(transaction.brl_amount))}
        </Text>
      </View>
    </GlassCard>
  );
}
