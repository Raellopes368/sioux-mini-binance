import { Text, View } from 'react-native';

type WalletAssetRowProps = {
  label: string;
  value: string;
};

export function WalletAssetRow({ label, value }: WalletAssetRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-base font-medium text-text-primary">{value}</Text>
    </View>
  );
}
