<?php

namespace App\Http\Controllers;

use App\Http\Requests\Trade\BuyRequest;
use App\Http\Requests\Trade\SellRequest;
use App\Http\Resources\TransactionResource;
use App\Services\TradeService;
use Illuminate\Http\JsonResponse;

class TradeController extends Controller
{
    public function __construct(
        private readonly TradeService $tradeService,
    ) {}

    public function buy(BuyRequest $request): JsonResponse
    {
        $transaction = $this->tradeService->buy(
            $request->user(),
            (string) $request->input('amount'),
            (string) $request->input('expected_price'),
        );

        return (new TransactionResource($transaction))
            ->response()
            ->setStatusCode(201);
    }

    public function sell(SellRequest $request): JsonResponse
    {
        $transaction = $this->tradeService->sell(
            $request->user(),
            (string) $request->input('amount'),
            (string) $request->input('expected_price'),
        );

        return (new TransactionResource($transaction))
            ->response()
            ->setStatusCode(201);
    }
}
