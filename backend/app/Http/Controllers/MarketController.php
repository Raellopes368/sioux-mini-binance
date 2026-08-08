<?php

namespace App\Http\Controllers;

use App\Http\Resources\MarketPriceResource;
use App\Services\BitcoinPriceService;

class MarketController extends Controller
{
    public function __construct(
        private readonly BitcoinPriceService $bitcoinPriceService,
    ) {}

    public function btc(): MarketPriceResource
    {
        return new MarketPriceResource($this->bitcoinPriceService->getQuote());
    }
}
