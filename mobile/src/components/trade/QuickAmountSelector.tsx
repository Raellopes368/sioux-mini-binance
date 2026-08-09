import { Pressable, Text, View } from 'react-native';

type QuickAmountSelectorProps = {
  options: string[];
  onSelect: (option: string) => void;
};

export function QuickAmountSelector({
  options,
  onSelect,
}: QuickAmountSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          onPress={() => onSelect(option)}
          className="min-h-11 min-w-[72px] flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3">
          <Text className="text-sm font-semibold text-text-primary">
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
