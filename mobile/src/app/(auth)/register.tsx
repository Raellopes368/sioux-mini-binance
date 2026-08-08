import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, ToastAndroid, View } from "react-native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/contexts/auth-context";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório"),
    email: z.email("Informe um e-mail válido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(
    async ({ name, email, password, confirmPassword }) => {
      try {
        await signUp({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        });
        ToastAndroid.showWithGravity(
          "Conta criada com sucesso!",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      } catch {
        ToastAndroid.showWithGravity(
          "Não foi possível criar a conta. Tente novamente.",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      }
    },
  );

  return (
    <Screen scroll edges={["top", "left", "right", "bottom"]}>
      <Header
        title="Criar conta"
        subtitle="Comece a negociar Bitcoin em minutos"
        showBack
      />

      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              ref={ref}
              label="Nome"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              placeholder="Seu nome"
              error={errors.name?.message}
            />
          )}
        />
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
              placeholder="Crie uma senha"
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              ref={ref}
              label="Confirmar senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="Repita sua senha"
              error={errors.confirmPassword?.message}
            />
          )}
        />
      </View>

      <Button
        label="Criar conta"
        className="mt-6"
        loading={isLoading}
        onPress={() => {
          void onSubmit();
        }}
      />

      <View className="mt-6 flex-row items-center justify-center">
        <Text className="text-sm text-text-secondary">Já tem uma conta? </Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text className="text-sm font-semibold text-primary">
              Voltar ao login
            </Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
