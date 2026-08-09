import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors } from '@/constants/colors';

type TradeActionCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'buy' | 'sell';
  onPress: () => void;
};

export function TradeActionCard({
  title,
  description,
  icon,
  variant = 'buy',
  onPress,
}: TradeActionCardProps) {
  const accent = variant === 'buy' ? colors.primary : colors.error;
  const softBg = variant === 'buy' ? 'bg-primary-soft' : 'bg-error/15';

  return (
    <GlassCard
      containerClassName="min-h-28 flex-1"
      className="p-5"
      onPress={onPress}>
      <View
        className={`mb-4 h-11 w-11 items-center justify-center rounded-full ${softBg}`}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <Text className="text-lg font-semibold text-text-primary">{title}</Text>
      <Text className="mt-1 text-sm text-text-secondary">{description}</Text>
    </GlassCard>
  );
}
