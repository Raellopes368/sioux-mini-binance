import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import type { TradeSide } from '@/types/trade';
import { formatBRL, formatBTC } from '@/utils/currency';

type SuccessParams = {
  side?: string;
  brlAmount?: string;
  btcAmount?: string;
  transactionId?: string;
};

export default function TradeSuccessScreen() {
  const params = useLocalSearchParams<SuccessParams>();
  const side = (params.side === 'sell' ? 'sell' : 'buy') as TradeSide;
  const brlAmount = Number(params.brlAmount ?? 0);
  const btcAmount = Number(params.btcAmount ?? 0);
  const transactionId = params.transactionId ?? 'TRX-000000';
  const isBuy = side === 'buy';

  return (
    <Screen className="justify-center" edges={['top', 'left', 'right', 'bottom']}>
      <View className="items-center">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
        </View>
        <Text className="text-center text-3xl font-semibold text-text-primary">
          {isBuy ? 'Compra concluída' : 'Venda concluída'}
        </Text>
        <Text className="mt-2 text-center text-base text-text-secondary">
          Sua ordem foi executada com sucesso
        </Text>
      </View>

      <GlassCard containerClassName="mt-8" className="p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm text-text-secondary">Quantidade de BTC</Text>
          <Text className="text-base font-semibold text-text-primary">
            {formatBTC(btcAmount)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-text-secondary">Valor em BRL</Text>
          <Text className="text-base font-semibold text-text-primary">
            {formatBRL(brlAmount)}
          </Text>
        </View>
      </GlassCard>

      <View className="mt-6 gap-3">
        <Button
          label="Voltar ao início"
          onPress={() => router.replace('/(tabs)')}
        />
        <Button
          label="Ver transação"
          variant="secondary"
          onPress={() => router.replace(`/transaction/${transactionId}`)}
        />
      </View>
    </Screen>
  );
}
