<?php

use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;

beforeEach(function (): void {
    Cache::flush();
    Cache::put(config('bitcoin.cache_key'), [
        'price' => '250000.00',
        'expires_at' => now()->utc()->addSeconds((int) config('bitcoin.cache_ttl_seconds'))->toIso8601ZuluString(),
    ], (int) config('bitcoin.cache_ttl_seconds'));
});

test('authenticated user can view own wallet', function (): void {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/wallet')
        ->assertOk()
        ->assertJsonPath('data.brl_balance', '10000.00')
        ->assertJsonPath('data.btc_balance', '0.00000000')
        ->assertJsonPath('data.total_balance_brl', '10000.00');
});

test('wallet total_balance_brl includes btc valued at current price', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '8500.00',
        'btc_balance' => '0.00600000',
    ]);

    Sanctum::actingAs($user);

    $btcInBrl = Money::mul('0.00600000', '250000.00', Money::BRL_SCALE);
    $expectedTotal = Money::add('8500.00', $btcInBrl, Money::BRL_SCALE);

    $this->getJson('/api/wallet')
        ->assertOk()
        ->assertJsonPath('data.total_balance_brl', $expectedTotal);
});

test('wallet endpoint never exposes another users wallet', function (): void {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $userB->wallet->update([
        'brl_balance' => '500.00',
        'btc_balance' => '1.00000000',
    ]);

    Sanctum::actingAs($userA);

    $response = $this->getJson('/api/wallet')->assertOk();

    expect($response->json('data.id'))->toBe($userA->wallet->id);
    expect($response->json('data.brl_balance'))->toBe('10000.00');
    expect($response->json('data.brl_balance'))->not->toBe('500.00');
});
