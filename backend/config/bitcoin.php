<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Fake BTC Market Price
    |--------------------------------------------------------------------------
    |
    | Centralized settings for the simulated Bitcoin price used by the market
    | endpoint and trade operations. Values are stored/returned as BRL strings
    | with two decimal places.
    |
    */

    'cache_key' => env('BITCOIN_PRICE_CACHE_KEY', 'market:btc:price'),

    'cache_ttl_seconds' => (int) env('BITCOIN_PRICE_CACHE_TTL', 10),

    'min_price' => env('BITCOIN_MIN_PRICE', '200000.00'),

    'max_price' => env('BITCOIN_MAX_PRICE', '300000.00'),

];
