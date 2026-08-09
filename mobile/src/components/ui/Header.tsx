import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/constants/colors';

type HeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightSlot,
}: HeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between pt-2">
      <View className="min-h-11 flex-1 flex-row items-center">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={onBack ?? (() => router.back())}
            className="mr-3 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-text-primary">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 text-sm text-text-secondary">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {rightSlot}
    </View>
  );
}
