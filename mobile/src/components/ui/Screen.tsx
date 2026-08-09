import type { ReactNode } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const backgroundImage = require("@/assets/images/background.png");

const FLOATING_TAB_BAR_HEIGHT = 64;

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  className?: string;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ["top", "left", "right"],
  className,
}: ScreenProps) {
  const contentClassName = [
    "flex-1 bg-transparent",
    padded ? "px-5" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      className="flex-1 bg-background"
    >
      <View className="flex-1 bg-black/25">
        <SafeAreaView className="flex-1 bg-transparent" edges={edges}>
          <KeyboardAvoidingView
            className="flex-1"
            style={{ flex: 1 }}
            behavior="padding"
          >
            {scroll ? (
              <ScrollView
                className={contentClassName}
                contentContainerClassName="grow"
                contentContainerStyle={{ paddingBottom: 80 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View className={contentClassName}>{children}</View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
