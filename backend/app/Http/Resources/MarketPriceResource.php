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
        /** @var array{price: string, expires_at: string} $quote */
        $quote = $this->resource;

        return [
            'symbol' => 'BTC',
            'price' => $quote['price'],
            'currency' => 'BRL',
            'expires_at' => $quote['expires_at'],
        ];
    }
}
