<?php

namespace App\Http\Resources;

use App\Models\Wallet;
use App\Services\BitcoinPriceService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Wallet */
class WalletResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $btcPrice = app(BitcoinPriceService::class)->getPrice();
        $btcInBrl = Money::mul((string) $this->btc_balance, $btcPrice, Money::BRL_SCALE);

        return [
            'id' => $this->id,
            'brl_balance' => $this->brl_balance,
            'btc_balance' => $this->btc_balance,
            'total_balance_brl' => Money::add((string) $this->brl_balance, $btcInBrl, Money::BRL_SCALE),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
