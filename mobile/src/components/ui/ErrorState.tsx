import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

import { Button } from './Button';
import { GlassCard } from './GlassCard';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Algo deu errado',
  description = 'Tente novamente em instantes.',
  onRetry,
}: ErrorStateProps) {
  return (
    <GlassCard className="items-center justify-center px-6 py-12">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-white/10">
        <Ionicons name="alert-circle-outline" size={28} color={colors.error} />
      </View>
      <Text className="text-center text-lg font-semibold text-text-primary">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-text-secondary">
        {description}
      </Text>
      {onRetry ? (
        <Button
          label="Tentar novamente"
          onPress={onRetry}
          className="mt-6 w-full"
          variant="secondary"
        />
      ) : null}
    </GlassCard>
  );
}
