import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from 'react-native';

import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-white/15 bg-white/10',
  danger: 'bg-error',
  ghost: 'bg-transparent',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-background',
  secondary: 'text-text-primary',
  danger: 'text-text-primary',
  ghost: 'text-primary',
};

export function Button({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={[
        'min-h-14 items-center justify-center rounded-2xl px-5',
        variantClasses[variant],
        isDisabled ? 'opacity-40' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={({ pressed }) =>
        pressed && variant === 'primary' && !isDisabled
          ? { backgroundColor: colors.primaryPressed }
          : undefined
      }
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.primary}
        />
      ) : (
        <Text className={`text-base font-semibold ${labelClasses[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
