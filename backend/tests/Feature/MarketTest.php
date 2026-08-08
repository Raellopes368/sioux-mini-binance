<?php

use App\Services\BitcoinPriceService;
use App\Support\Money;
use Illuminate\Support\Facades\Cache;

test('btc market price is within configured range', function (): void {
    Cache::flush();

    $response = $this->getJson('/api/market/btc')->assertOk();

    $price = (string) $response->json('data.price');
    $min = Money::normalizeBrl((string) config('bitcoin.min_price'));
    $max = Money::normalizeBrl((string) config('bitcoin.max_price'));

    expect(Money::compare($price, $min, Money::BRL_SCALE))->toBeGreaterThanOrEqual(0);
    expect(Money::compare($price, $max, Money::BRL_SCALE))->toBeLessThanOrEqual(0);
    expect($response->json('data.symbol'))->toBe('BTC');
    expect($response->json('data.currency'))->toBe('BRL');
    expect($response->json('data.changePercent24h'))->toBeNumeric();
    expect($response->json('data.changePercent24h'))->toBeGreaterThanOrEqual(-5);
    expect($response->json('data.changePercent24h'))->toBeLessThanOrEqual(5);
    expect($response->json('data.expires_at'))->not->toBeNull();
});

test('btc market price is cached during ttl', function (): void {
    Cache::flush();

    $service = app(BitcoinPriceService::class);
    $first = $service->getPrice();
    $second = $service->getPrice();

    expect($second)->toBe($first);

    $responseA = $this->getJson('/api/market/btc')->assertOk();
    $responseB = $this->getJson('/api/market/btc')->assertOk();

    expect($responseA->json('data.price'))->toBe($responseB->json('data.price'));
    expect($responseA->json('data.price'))->toBe($first);
    expect($responseA->json('data.changePercent24h'))->toBe($responseB->json('data.changePercent24h'));
    expect($responseA->json('data.expires_at'))->toBe($responseB->json('data.expires_at'));
});

test('btc market price returns expires_at coherent with cached quote', function (): void {
    Cache::flush();

    $expiresAt = now()->utc()->addSeconds(10)->toIso8601ZuluString();

    Cache::put(config('bitcoin.cache_key'), [
        'price' => '250000.00',
        'changePercent24h' => 2.45,
        'expires_at' => $expiresAt,
    ], 10);

    $response = $this->getJson('/api/market/btc')->assertOk();

    $response->assertJsonPath('data.symbol', 'BTC')
        ->assertJsonPath('data.price', '250000.00')
        ->assertJsonPath('data.changePercent24h', 2.45)
        ->assertJsonPath('data.currency', 'BRL')
        ->assertJsonPath('data.expires_at', $expiresAt);

    $quote = app(BitcoinPriceService::class)->getQuote();

    expect($quote['price'])->toBe('250000.00');
    expect($quote['changePercent24h'])->toBe(2.45);
    expect($quote['expires_at'])->toBe($expiresAt);
});
