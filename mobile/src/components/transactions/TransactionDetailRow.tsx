import { Text, View } from 'react-native';

type TransactionDetailRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

export function TransactionDetailRow({
  label,
  value,
  valueClassName = 'text-text-primary',
}: TransactionDetailRowProps) {
  return (
    <View className="flex-row items-start justify-between border-b border-white/10 py-4 last:border-b-0">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text
        className={`max-w-[60%] text-right text-sm font-semibold ${valueClassName}`}>
        {value}
      </Text>
    </View>
  );
}
