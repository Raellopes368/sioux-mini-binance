import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors } from '@/constants/colors';

type TradeAmountInputProps = TextInputProps & {
  prefix: string;
  suffix?: string;
  helperLabel?: string;
  helperValue?: string;
  error?: string;
};

export function TradeAmountInput({
  prefix,
  suffix,
  helperLabel,
  helperValue,
  error,
  ...props
}: TradeAmountInputProps) {
  return (
    <View>
      <GlassCard
        className={['px-5 py-5', error ? 'border-error' : ''].join(' ')}
        intensity={45}>
        <View className="flex-row items-end">
          {prefix ? (
            <Text className="mr-2 pb-1 text-2xl font-medium text-text-secondary">
              {prefix}
            </Text>
          ) : null}
          <TextInput
            className="min-h-12 flex-1 text-4xl font-semibold text-text-primary"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            {...props}
          />
          {suffix ? (
            <Text className="ml-2 pb-1 text-lg font-medium text-text-secondary">
              {suffix}
            </Text>
          ) : null}
        </View>
        {helperLabel && helperValue ? (
          <View className="mt-4 border-t border-white/10 pt-4">
            <Text className="text-sm text-text-secondary">{helperLabel}</Text>
            <Text className="mt-1 text-xl font-semibold text-text-primary">
              {helperValue}
            </Text>
          </View>
        ) : null}
      </GlassCard>
      {error ? <Text className="mt-2 text-sm text-error">{error}</Text> : null}
    </View>
  );
}
