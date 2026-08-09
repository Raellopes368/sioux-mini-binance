import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  intensity?: number;
  onPress?: () => void;
};

export function GlassCard({
  children,
  className,
  containerClassName,
  intensity = 40,
  onPress,
}: GlassCardProps) {
  const hasCustomRadius = Boolean(containerClassName?.includes('rounded'));
  const outerClassName = [
    'overflow-hidden border border-white/15',
    hasCustomRadius ? '' : 'rounded-3xl',
    containerClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <BlurView
        intensity={intensity}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        className="bg-white/5"
      />
      <View className={['relative z-10', className ?? ''].filter(Boolean).join(' ')}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={outerClassName}>
        {content}
      </Pressable>
    );
  }

  return <View className={outerClassName}>{content}</View>;
}
