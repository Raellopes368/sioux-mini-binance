<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Http\Requests\Transaction\IndexRequest;
use App\Http\Resources\TransactionResource;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactionService,
    ) {}

    public function index(IndexRequest $request): AnonymousResourceCollection
    {
        $transactions = $this->transactionService->list(
            $request->user(),
            $request->enum('type', TransactionType::class),
        );

        return TransactionResource::collection($transactions);
    }

    public function show(Request $request, int $id): TransactionResource
    {
        $transaction = $this->transactionService->find($request->user(), $id);

        return new TransactionResource($transaction);
    }
}
