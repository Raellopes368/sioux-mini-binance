<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Transaction */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'btc_amount' => $this->btc_amount,
            'brl_amount' => $this->brl_amount,
            'btc_price' => $this->btc_price,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
