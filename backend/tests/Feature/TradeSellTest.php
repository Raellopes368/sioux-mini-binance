<?php

use App\Enums\TransactionType;
use App\Models\Transaction;
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

test('valid sell debits btc credits brl and creates transaction', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '10000.00',
        'btc_balance' => '0.01000000',
    ]);

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/trade/sell', [
        'amount' => 0.002,
        'expected_price' => '250000.00',
    ])->assertCreated();

    $brlAmount = Money::mul('0.00200000', '250000.00', Money::BRL_SCALE);

    $response->assertJsonPath('data.type', TransactionType::SELL->value)
        ->assertJsonPath('data.btc_amount', '0.00200000')
        ->assertJsonPath('data.brl_amount', $brlAmount)
        ->assertJsonPath('data.btc_price', '250000.00');

    $user->wallet->refresh();

    expect($user->wallet->btc_balance)->toBe('0.00800000');
    expect($user->wallet->brl_balance)->toBe(Money::add('10000.00', $brlAmount, Money::BRL_SCALE));
    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('sell fails with insufficient btc balance and does not mutate wallet', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00100000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/trade/sell', [
        'amount' => 0.002,
        'expected_price' => '250000.00',
    ])->assertUnprocessable()
        ->assertJsonPath('message', 'Saldo em BTC insuficiente.');

    $user->wallet->refresh();

    expect($user->wallet->btc_balance)->toBe('0.00100000');
    expect($user->wallet->brl_balance)->toBe('10000.00');
    expect(Transaction::query()->count())->toBe(0);
});

test('sell fails with zero or negative amount', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'btc_balance' => '1.00000000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/trade/sell', [
        'amount' => 0,
        'expected_price' => '250000.00',
    ])->assertUnprocessable();

    $this->postJson('/api/trade/sell', [
        'amount' => -0.1,
        'expected_price' => '250000.00',
    ])->assertUnprocessable();

    expect(Transaction::query()->count())->toBe(0);
    expect($user->wallet()->first()->btc_balance)->toBe('1.00000000');
});

test('sell with matching expected_price uses backend price', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '10000.00',
        'btc_balance' => '0.01000000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/trade/sell', [
        'amount' => '0.00100000',
        'expected_price' => '250000.00',
    ])
        ->assertCreated()
        ->assertJsonPath('data.type', TransactionType::SELL->value)
        ->assertJsonPath('data.btc_price', '250000.00')
        ->assertJsonPath('data.brl_amount', '250.00');

    $user->wallet->refresh();

    expect($user->wallet->btc_balance)->toBe('0.00900000');
    expect($user->wallet->brl_balance)->toBe('10250.00');
});

test('sell with changed price returns 409 and does not mutate wallet or create transaction', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '10000.00',
        'btc_balance' => '0.01000000',
    ]);

    Sanctum::actingAs($user);

    Cache::put(config('bitcoin.cache_key'), [
        'price' => '295428.91',
        'expires_at' => now()->utc()->addSeconds((int) config('bitcoin.cache_ttl_seconds'))->toIso8601ZuluString(),
    ], (int) config('bitcoin.cache_ttl_seconds'));

    $this->postJson('/api/trade/sell', [
        'amount' => '0.00100000',
        'expected_price' => '292713.37',
    ])
        ->assertConflict()
        ->assertJsonPath('message', 'O preço do Bitcoin foi atualizado.')
        ->assertJsonPath('data.previous_price', '292713.37')
        ->assertJsonPath('data.current_price', '295428.91');

    $user->wallet->refresh();

    expect($user->wallet->brl_balance)->toBe('10000.00');
    expect($user->wallet->btc_balance)->toBe('0.01000000');
    expect(Transaction::query()->count())->toBe(0);
});

test('sell requires expected_price', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'btc_balance' => '0.01000000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/trade/sell', [
        'amount' => '0.00100000',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['expected_price']);

    expect(Transaction::query()->count())->toBe(0);
});

test('sell rejects non positive expected_price', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'btc_balance' => '0.01000000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/trade/sell', [
        'amount' => '0.00100000',
        'expected_price' => 0,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['expected_price']);

    $this->postJson('/api/trade/sell', [
        'amount' => '0.00100000',
        'expected_price' => -10,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['expected_price']);

    expect(Transaction::query()->count())->toBe(0);
    expect($user->wallet()->first()->btc_balance)->toBe('0.01000000');
});
