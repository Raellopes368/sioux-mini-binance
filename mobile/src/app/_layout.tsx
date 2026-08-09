import "@/global.css";
import "@/nativewind";

import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { queryClient } from "@/services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [inAuthGroup, isAuthenticated, isInitializing, router]);

  useEffect(() => {
    if (!isInitializing) {
      void SplashScreen.hideAsync();
    }
  }, [isInitializing]);

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated && !inAuthGroup) {
    return null;
  }

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="trade/buy" />
        <Stack.Screen name="trade/sell" />
        <Stack.Screen name="trade/success" />

        <Stack.Screen name="transaction/[id]" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </AuthProvider>
  );
}
