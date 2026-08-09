import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { TradeSide } from '@/types/trade';
import { formatBRL, formatBTC } from '@/utils/currency';

import { Button } from '@/components/ui/Button';

type TradeConfirmationModalProps = {
  visible: boolean;
  side: TradeSide;
  brlAmount: number;
  btcAmount: number;
  btcPrice: number;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TradeConfirmationModal({
  visible,
  side,
  brlAmount,
  btcAmount,
  btcPrice,
  loading = false,
  onConfirm,
  onCancel,
}: TradeConfirmationModalProps) {
  const isBuy = side === 'buy';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable
        className="flex-1 justify-end bg-black/55"
        onPress={onCancel}>
        <Pressable onPress={(event) => event.stopPropagation()}>
          <View
            className="rounded-b-none rounded-t-3xl border border-border px-5 pb-10 pt-4"
            style={{ backgroundColor: colors.cardElevated }}>
            <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-white/20" />
            <Text className="text-xl font-semibold text-text-primary">
              {isBuy ? 'Confirmar compra' : 'Confirmar venda'}
            </Text>

            <View
              className="mt-5 gap-4 rounded-3xl border border-border p-5"
              style={{ backgroundColor: colors.card }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">
                  {isBuy ? 'Você paga' : 'Você vende'}
                </Text>
                <Text className="text-base font-semibold text-text-primary">
                  {isBuy ? formatBRL(brlAmount) : formatBTC(btcAmount)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">Você recebe</Text>
                <Text className="text-base font-semibold text-primary">
                  {isBuy ? formatBTC(btcAmount) : formatBRL(brlAmount)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">
                  Preço do Bitcoin
                </Text>
                <Text className="text-base font-semibold text-text-primary">
                  {formatBRL(btcPrice)}
                </Text>
              </View>
            </View>

            <View className="mt-6 gap-3">
              <Button
                label={isBuy ? 'Confirmar compra' : 'Confirmar venda'}
                onPress={onConfirm}
                loading={loading}
                variant={isBuy ? 'primary' : 'danger'}
              />
              <Button
                label="Cancelar"
                onPress={onCancel}
                variant="ghost"
                disabled={loading}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
