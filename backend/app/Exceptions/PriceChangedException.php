<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceChangedException extends Exception
{
    public function __construct(
        public readonly string $expectedPrice,
        public readonly string $currentPrice,
    ) {
        parent::__construct('O preço do Bitcoin foi atualizado.');
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'data' => [
                'previous_price' => $this->expectedPrice,
                'current_price' => $this->currentPrice,
            ],
        ], 409);
    }
}
