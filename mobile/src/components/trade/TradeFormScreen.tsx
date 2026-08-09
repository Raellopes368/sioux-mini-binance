import axios from "axios";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Screen } from "@/components/ui/Screen";
import { useBtcPrice } from "@/hooks/use-btc-price";
import { useWallet } from "@/hooks/use-wallet";
import { tradeService } from "@/services/trade.service";
import type { TradeSide } from "@/types/trade";
import {
  formatBRL,
  formatBRLInput,
  formatBTC,
  formatBTCAmount,
  parseBRLInput,
} from "@/utils/currency";
import { calculateBrlFromBtc, calculateBtcFromBrl } from "@/utils/trade";

import { queryClient } from "@/services/queryClient";
import { QuickAmountSelector } from "./QuickAmountSelector";
import { TradeAmountInput } from "./TradeAmountInput";
import { TradeConfirmationModal } from "./TradeConfirmationModal";
import { TradeSummary } from "./TradeSummary";

type TradeFormScreenProps = {
  side: TradeSide;
};

const BUY_QUICK_OPTIONS = ["R$ 100", "R$ 500", "R$ 1.000", "Máx"];
const SELL_QUICK_OPTIONS = ["25%", "50%", "75%", "Máx"];

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Não foi possível concluir a operação";
}

export function TradeFormScreen({ side }: TradeFormScreenProps) {
  const isBuy = side === "buy";
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
    refetch: refreshWallet,
  } = useWallet();
  const {
    data: price,
    isLoading: priceLoading,
    error: priceError,
    refetch: refreshPrice,
  } = useBtcPrice();

  const [brlAmount, setBrlAmount] = useState(1000);
  const [btcAmount, setBtcAmount] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const isLoading = walletLoading || priceLoading;
  const error = walletError || priceError;

  useEffect(() => {
    if (!isBuy && wallet && btcAmount === 0) {
      const btcBalance = Number(wallet.btc_balance);
      setBtcAmount(Number((btcBalance * 0.25).toFixed(8)));
    }
  }, [btcAmount, isBuy, wallet]);

  const derivedBtc = useMemo(() => {
    if (!price) {
      return 0;
    }
    return isBuy
      ? calculateBtcFromBrl(brlAmount, Number(price.price))
      : btcAmount;
  }, [brlAmount, btcAmount, isBuy, price]);

  const derivedBrl = useMemo(() => {
    if (!price) {
      return 0;
    }
    return isBuy
      ? brlAmount
      : calculateBrlFromBtc(btcAmount, Number(price.price));
  }, [brlAmount, btcAmount, isBuy, price]);

  const updateBrlAmount = (value: number) => {
    setSubmitError(undefined);
    setBrlAmount(value);
  };

  const updateBtcAmount = (value: number) => {
    setSubmitError(undefined);
    setBtcAmount(value);
  };

  const handleBuyQuickSelect = (option: string) => {
    if (!wallet) {
      return;
    }
    if (option === "Máx") {
      updateBrlAmount(Number(wallet.brl_balance));
      return;
    }
    const mapped: Record<string, number> = {
      "R$ 100": 100,
      "R$ 500": 500,
      "R$ 1.000": 1000,
    };
    updateBrlAmount(mapped[option] ?? 0);
  };

  const handleSellQuickSelect = (option: string) => {
    if (!wallet) {
      return;
    }
    const ratios: Record<string, number> = {
      "25%": 0.25,
      "50%": 0.5,
      "75%": 0.75,
      Máx: 1,
    };
    const ratio = ratios[option] ?? 0;
    const btcBalance = Number(wallet.btc_balance);
    updateBtcAmount(Number((btcBalance * ratio).toFixed(8)));
  };

  const handleConfirm = async () => {
    if (!price) {
      return;
    }

    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const result = isBuy
        ? await tradeService.buy({
            amount: derivedBrl,
            expectedPrice: price.price,
          })
        : await tradeService.sell({
            amount: derivedBtc,
            expectedPrice: price.price,
          });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallet"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
      setConfirmVisible(false);
      router.replace({
        pathname: "/trade/success",
        params: {
          side: result.side,
          brlAmount: String(result.brlAmount),
          btcAmount: String(result.btcAmount),
          transactionId: result.transactionId,
        },
      });
    } catch (err) {
      setConfirmVisible(false);
      setSubmitError(getApiErrorMessage(err));

      if (axios.isAxiosError(err) && err.response?.status === 409) {
        void refreshPrice();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen scroll>
        <Header title={isBuy ? "Comprar Bitcoin" : "Vender Bitcoin"} showBack />
        <LoadingSkeleton className="mb-4 h-24" />
        <LoadingSkeleton className="mb-4 h-40" />
        <LoadingSkeleton className="h-32" />
      </Screen>
    );
  }

  if (error || !wallet || !price) {
    return (
      <Screen>
        <Header title={isBuy ? "Comprar Bitcoin" : "Vender Bitcoin"} showBack />
        <ErrorState
          description={
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os dados da negociação"
          }
          onRetry={() => {
            void refreshWallet();
            void refreshPrice();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title={isBuy ? "Comprar Bitcoin" : "Vender Bitcoin"} showBack />

      <GlassCard containerClassName="mb-5" className="p-4">
        <Text className="text-sm text-text-secondary">Preço atual</Text>
        <Text className="mt-1 text-base font-semibold text-text-primary">
          1 BTC = {formatBRL(Number(price.price))}
        </Text>
        <Text className="mt-3 text-sm text-text-secondary">Disponível</Text>
        <Text className="mt-1 text-base font-semibold text-text-primary">
          {isBuy
            ? formatBRL(Number(wallet.brl_balance))
            : formatBTC(Number(wallet.btc_balance))}
        </Text>
      </GlassCard>

      {isBuy ? (
        <TradeAmountInput
          prefix="R$"
          value={formatBRLInput(brlAmount)}
          onChangeText={(text) => updateBrlAmount(parseBRLInput(text))}
          helperLabel="Você recebe"
          helperValue={formatBTC(derivedBtc)}
          error={submitError}
        />
      ) : (
        <TradeAmountInput
          prefix=""
          suffix="BTC"
          value={formatBTCAmount(btcAmount)}
          onChangeText={(text) => {
            const normalized = text.replace(",", ".");
            const parsed = Number(normalized);
            updateBtcAmount(Number.isFinite(parsed) ? parsed : 0);
          }}
          helperLabel="Você recebe"
          helperValue={formatBRL(derivedBrl)}
          error={submitError}
        />
      )}

      <View className="mt-4">
        <QuickAmountSelector
          options={isBuy ? BUY_QUICK_OPTIONS : SELL_QUICK_OPTIONS}
          onSelect={isBuy ? handleBuyQuickSelect : handleSellQuickSelect}
        />
      </View>

      <View className="mt-5">
        <TradeSummary
          rows={
            isBuy
              ? [
                  { label: "Valor", value: formatBRL(derivedBrl) },
                  {
                    label: "Preço do BTC",
                    value: formatBRL(Number(price.price)),
                  },
                  { label: "Você recebe", value: formatBTC(derivedBtc) },
                ]
              : [
                  { label: "Quantidade de BTC", value: formatBTC(derivedBtc) },
                  {
                    label: "Preço do BTC",
                    value: formatBRL(Number(price.price)),
                  },
                  { label: "Você recebe", value: formatBRL(derivedBrl) },
                ]
          }
        />
      </View>

      <Button
        label={isBuy ? "Comprar Bitcoin" : "Vender Bitcoin"}
        className="mt-6"
        variant={isBuy ? "primary" : "danger"}
        onPress={() => {
          setSubmitError(undefined);
          setConfirmVisible(true);
        }}
      />

      <TradeConfirmationModal
        visible={confirmVisible}
        side={side}
        brlAmount={derivedBrl}
        btcAmount={derivedBtc}
        btcPrice={Number(price.price)}
        loading={submitting}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          void handleConfirm();
        }}
      />
    </Screen>
  );
}
