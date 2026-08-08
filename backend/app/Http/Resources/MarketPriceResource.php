<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MarketPriceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array{price: string, changePercent24h: float|int, expires_at: string} $quote */
        $quote = $this->resource;

        return [
            'symbol' => 'BTC',
            'price' => $quote['price'],
            'changePercent24h' => (float) $quote['changePercent24h'],
            'currency' => 'BRL',
            'expires_at' => $quote['expires_at'],
        ];
    }
}
