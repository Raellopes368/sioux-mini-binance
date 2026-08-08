<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\PriceChangedException;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TradeService
{
    public function __construct(
        private readonly BitcoinPriceService $bitcoinPriceService,
    ) {}

    public function buy(User $user, string $brlAmount, string $expectedPrice): Transaction
    {
        $brlAmount = Money::normalizeBrl($brlAmount);

        if (! Money::isPositive($brlAmount, Money::BRL_SCALE)) {
            throw new InsufficientBalanceException('O valor deve ser maior que zero.');
        }

        $btcPrice = $this->resolveCurrentPrice($expectedPrice);

        return DB::transaction(function () use ($user, $brlAmount, $btcPrice): Transaction {
            $wallet = $this->lockWallet($user);

            if (Money::compare($wallet->brl_balance, $brlAmount, Money::BRL_SCALE) < 0) {
                throw new InsufficientBalanceException('Saldo em BRL insuficiente.');
            }

            $btcAmount = Money::div($brlAmount, $btcPrice, Money::BTC_SCALE);

            $newBrl = Money::sub($wallet->brl_balance, $brlAmount, Money::BRL_SCALE);
            $newBtc = Money::add($wallet->btc_balance, $btcAmount, Money::BTC_SCALE);

            $this->assertNonNegativeBalances($newBrl, $newBtc);

            $wallet->brl_balance = $newBrl;
            $wallet->btc_balance = $newBtc;
            $wallet->save();

            return $user->transactions()->create([
                'type' => TransactionType::BUY,
                'btc_amount' => $btcAmount,
                'brl_amount' => $brlAmount,
                'btc_price' => $btcPrice,
            ]);
        });
    }

    public function sell(User $user, string $btcAmount, string $expectedPrice): Transaction
    {
        $btcAmount = Money::normalizeBtc($btcAmount);

        if (! Money::isPositive($btcAmount, Money::BTC_SCALE)) {
            throw new InsufficientBalanceException('A quantidade deve ser maior que zero.');
        }

        $btcPrice = $this->resolveCurrentPrice($expectedPrice);

        return DB::transaction(function () use ($user, $btcAmount, $btcPrice): Transaction {
            $wallet = $this->lockWallet($user);

            if (Money::compare($wallet->btc_balance, $btcAmount, Money::BTC_SCALE) < 0) {
                throw new InsufficientBalanceException('Saldo em BTC insuficiente.');
            }

            $brlAmount = Money::mul($btcAmount, $btcPrice, Money::BRL_SCALE);

            $newBtc = Money::sub($wallet->btc_balance, $btcAmount, Money::BTC_SCALE);
            $newBrl = Money::add($wallet->brl_balance, $brlAmount, Money::BRL_SCALE);

            $this->assertNonNegativeBalances($newBrl, $newBtc);

            $wallet->brl_balance = $newBrl;
            $wallet->btc_balance = $newBtc;
            $wallet->save();

            return $user->transactions()->create([
                'type' => TransactionType::SELL,
                'btc_amount' => $btcAmount,
                'brl_amount' => $brlAmount,
                'btc_price' => $btcPrice,
            ]);
        });
    }

    private function resolveCurrentPrice(string $expectedPrice): string
    {
        $expectedPrice = Money::normalizeBrl($expectedPrice);
        $currentPrice = $this->bitcoinPriceService->getPrice();

        if (Money::compare($expectedPrice, $currentPrice, Money::BRL_SCALE) !== 0) {
            throw new PriceChangedException($expectedPrice, $currentPrice);
        }

        return $currentPrice;
    }

    private function lockWallet(User $user): Wallet
    {
        $wallet = Wallet::query()
            ->where('user_id', $user->id)
            ->lockForUpdate()
            ->first();

        if ($wallet === null) {
            throw new RuntimeException('Carteira não encontrada.');
        }

        return $wallet;
    }

    private function assertNonNegativeBalances(string $brlBalance, string $btcBalance): void
    {
        if (Money::isNegative($brlBalance, Money::BRL_SCALE) || Money::isNegative($btcBalance, Money::BTC_SCALE)) {
            throw new InsufficientBalanceException('Operação resultaria em saldo negativo.');
        }
    }
}
