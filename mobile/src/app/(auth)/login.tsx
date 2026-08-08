import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, Text, ToastAndroid, View } from "react-native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      await signIn({ email, password });
    } catch (err) {
      ToastAndroid.showWithGravity(
        "Não foi possível entrar. Tente novamente.",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
  });

  return (
    <Screen scroll edges={["top", "left", "right", "bottom"]}>
      <View className="flex-1 justify-center py-10">
        <View className="mb-10 items-center">
          <Image
            source={require("@/assets/images/logo.png")}
            className="h-20 w-20"
            resizeMode="contain"
          />
          <Text className="text-3xl font-semibold text-text-primary">
            Liqd Binance
          </Text>
          <Text className="mt-2 text-center text-base text-text-secondary">
            Negocie Bitcoin de forma simples e segura
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                label="E-mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoComplete="email"
                placeholder="exemplo@email.com"
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                label="Senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                placeholder="Sua senha"
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <Button
          label="Entrar"
          className="mt-6"
          loading={isLoading}
          onPress={() => {
            void onSubmit();
          }}
        />

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-sm text-text-secondary">
            Não tem uma conta?{" "}
          </Text>
          <Link href="/register" asChild>
            <Pressable>
              <Text className="text-sm font-semibold text-primary">
                Criar conta
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
