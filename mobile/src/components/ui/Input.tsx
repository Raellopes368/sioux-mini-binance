import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { GlassCard } from "@/components/ui/GlassCard";
import { colors } from "@/constants/colors";

export type InputProps = TextInputProps & {
  label: string;
  error?: string;
  containerClassName?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, secureTextEntry, containerClassName, className, ...props },
  ref,
) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const isPassword = Boolean(secureTextEntry);

  return (
    <View className={containerClassName}>
      <Text className="mb-2 text-sm font-medium text-text-secondary">
        {label}
      </Text>
      <GlassCard
        containerClassName={error ? "rounded-2xl border-error" : "rounded-2xl"}
        className="min-h-14 flex-row items-center px-4"
        intensity={30}
      >
        <TextInput
          ref={ref}
          className={[
            "flex-1 py-3 text-base text-text-primary",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword ? hidden : false}
          autoCapitalize="none"
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
            hitSlop={12}
            onPress={() => setHidden((value) => !value)}
            className="ml-2"
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </GlassCard>
      {error ? (
        <Text className="mt-1.5 text-sm text-error">{error}</Text>
      ) : null}
    </View>
  );
});
