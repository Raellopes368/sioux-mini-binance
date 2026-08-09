import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/auth-context";
import { getNameInitials } from "@/utils/getNameInitials";
import { useMemo } from "react";

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuth();
  const avatarInitials = useMemo(
    () => getNameInitials(user?.name ?? ""),
    [user?.name],
  );

  return (
    <Screen scroll>
      <Header title="Perfil" subtitle="Informações da conta" />

      <GlassCard className="items-center px-5 py-8">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <Text className="text-2xl font-semibold text-primary">
            {avatarInitials}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-text-primary">
          {user?.name ?? "Trader"}
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          {user?.email ?? "—"}
        </Text>
      </GlassCard>

      <GlassCard containerClassName="mt-5" className="p-5">
        <Text className="mb-4 text-base font-semibold text-text-primary">
          Informações da conta
        </Text>

        <View className="gap-4">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.textSecondary}
              />
            </View>
            <View>
              <Text className="text-xs text-text-secondary">Nome completo</Text>
              <Text className="text-sm font-medium text-text-primary">
                {user?.name ?? "—"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.textSecondary}
              />
            </View>
            <View>
              <Text className="text-xs text-text-secondary">E-mail</Text>
              <Text className="text-sm font-medium text-text-primary">
                {user?.email ?? "—"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={colors.textSecondary}
              />
            </View>
            <View>
              <Text className="text-xs text-text-secondary">
                Status da conta
              </Text>
              <Text className="text-sm font-medium text-primary">Ativa</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      <Button
        label="Sair"
        variant="secondary"
        className="mt-6"
        loading={isLoading}
        onPress={() => {
          void signOut();
        }}
      />
    </Screen>
  );
}
