<?php

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BitcoinPriceService;
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

test('valid buy debits brl credits btc and creates transaction', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/trade/buy', [
        'amount' => 1000,
        'expected_price' => '250000.00',
    ])->assertCreated();

    $btcAmount = Money::div('1000.00', '250000.00', Money::BTC_SCALE);

    $response->assertJsonPath('data.type', TransactionType::BUY->value)
        ->assertJsonPath('data.brl_amount', '1000.00')
        ->assertJsonPath('data.btc_amount', $btcAmount)
        ->assertJsonPath('data.btc_price', '250000.00');

    $user->wallet->refresh();

    expect($user->wallet->brl_balance)->toBe('9000.00');
    expect($user->wallet->btc_balance)->toBe($btcAmount);
    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('buy fails with insufficient brl balance and does not mutate wallet', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '100.00',
        'btc_balance' => '0.00000000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/trade/buy', [
        'amount' => 1000,
        'expected_price' => '250000.00',
    ])->assertUnprocessable()
        ->assertJsonPath('message', 'Saldo em BRL insuficiente.');

    $user->wallet->refresh();

    expect($user->wallet->brl_balance)->toBe('100.00');
    expect($user->wallet->btc_balance)->toBe('0.00000000');
    expect(Transaction::query()->count())->toBe(0);
});

test('buy fails with zero or negative amount', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/trade/buy', [
        'amount' => 0,
        'expected_price' => '250000.00',
    ])->assertUnprocessable();

    $this->postJson('/api/trade/buy', [
        'amount' => -10,
        'expected_price' => '250000.00',
    ])->assertUnprocessable();

    expect(Transaction::query()->count())->toBe(0);
    expect($user->wallet()->first()->brl_balance)->toBe('10000.00');
});

test('buy uses server side bitcoin price service', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->mock(BitcoinPriceService::class, function ($mock): void {
        $mock->shouldReceive('getPrice')->once()->andReturn('275000.00');
    });

    $this->postJson('/api/trade/buy', [
        'amount' => 275,
        'expected_price' => '275000.00',
    ])
        ->assertCreated()
        ->assertJsonPath('data.btc_price', '275000.00')
        ->assertJsonPath('data.btc_amount', '0.00100000');
});

test('buy with matching expected_price succeeds and stores backend price', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/trade/buy', [
        'amount' => '1000.00',
        'expected_price' => '250000.00',
    ])
        ->assertCreated()
        ->assertJsonPath('data.type', TransactionType::BUY->value)
        ->assertJsonPath('data.btc_price', '250000.00');

    $user->wallet->refresh();

    expect($user->wallet->brl_balance)->toBe('9000.00');
    expect(Money::compare($user->wallet->btc_balance, '0', Money::BTC_SCALE))->toBe(1);
    expect(Transaction::query()->where('user_id', $user->id)->where('type', TransactionType::BUY)->count())->toBe(1);
});

test('buy with changed price returns 409 and does not mutate wallet or create transaction', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    Cache::put(config('bitcoin.cache_key'), [
        'price' => '295428.91',
        'expires_at' => now()->utc()->addSeconds((int) config('bitcoin.cache_ttl_seconds'))->toIso8601ZuluString(),
    ], (int) config('bitcoin.cache_ttl_seconds'));

    $this->postJson('/api/trade/buy', [
        'amount' => '1000.00',
        'expected_price' => '292713.37',
    ])
        ->assertConflict()
        ->assertJsonPath('message', 'O preço do Bitcoin foi atualizado.')
        ->assertJsonPath('data.previous_price', '292713.37')
        ->assertJsonPath('data.current_price', '295428.91');

    $user->wallet->refresh();

    expect($user->wallet->brl_balance)->toBe('10000.00');
    expect($user->wallet->btc_balance)->toBe('0.00000000');
    expect(Transaction::query()->count())->toBe(0);
});

test('buy requires expected_price', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/trade/buy', [
        'amount' => '1000.00',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['expected_price']);

    expect(Transaction::query()->count())->toBe(0);
});

test('buy rejects non positive expected_price', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/trade/buy', [
        'amount' => '1000.00',
        'expected_price' => 0,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['expected_price']);

    $this->postJson('/api/trade/buy', [
        'amount' => '1000.00',
        'expected_price' => -1,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['expected_price']);

    expect(Transaction::query()->count())->toBe(0);
    expect($user->wallet()->first()->brl_balance)->toBe('10000.00');
});
