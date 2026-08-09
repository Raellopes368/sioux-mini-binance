import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors } from '@/constants/colors';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({
  title,
  description,
  icon = 'receipt-outline',
}: EmptyStateProps) {
  return (
    <GlassCard className="items-center justify-center px-6 py-12">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text className="text-center text-lg font-semibold text-text-primary">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center text-sm text-text-secondary">
          {description}
        </Text>
      ) : null}
    </GlassCard>
  );
}
