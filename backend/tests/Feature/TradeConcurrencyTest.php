<?php

use App\Exceptions\InsufficientBalanceException;
use App\Models\User;
use App\Services\TradeService;
use App\Support\Money;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

beforeEach(function (): void {
    Cache::flush();
    Cache::put(config('bitcoin.cache_key'), [
        'price' => '250000.00',
        'expires_at' => now()->utc()->addSeconds((int) config('bitcoin.cache_ttl_seconds'))->toIso8601ZuluString(),
    ], (int) config('bitcoin.cache_ttl_seconds'));
});

test('trade service locks wallet with for update inside a transaction', function (): void {
    if (DB::connection()->getDriverName() === 'sqlite') {
        $this->markTestSkipped(
            'SQLite grammar ignores FOR UPDATE. Production uses PostgreSQL with SELECT ... FOR UPDATE.'
        );
    }

    $user = User::factory()->create();
    $service = app(TradeService::class);

    $queries = [];

    DB::listen(function ($query) use (&$queries): void {
        $queries[] = $query->sql;
    });

    $service->buy($user, '1000.00', '250000.00');

    $lockedWalletQuery = collect($queries)->first(
        fn (string $sql): bool => str_contains(strtolower($sql), 'wallets')
            && str_contains(strtolower($sql), 'for update')
    );

    expect($lockedWalletQuery)->not->toBeNull();
});

test('sequential buys cannot overspend the same wallet balance', function (): void {
    $user = User::factory()->create();
    $user->wallet->update([
        'brl_balance' => '1000.00',
        'btc_balance' => '0.00000000',
    ]);

    $service = app(TradeService::class);

    $service->buy($user, '800.00', '250000.00');

    expect(fn () => $service->buy($user, '800.00', '250000.00'))
        ->toThrow(InsufficientBalanceException::class);

    $user->wallet->refresh();

    expect($user->wallet->brl_balance)->toBe('200.00');
    expect(Money::compare($user->wallet->btc_balance, '0', Money::BTC_SCALE))->toBe(1);
    expect($user->transactions()->count())->toBe(1);
});
