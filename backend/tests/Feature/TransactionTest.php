<?php

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('transactions endpoint returns only authenticated user records newest first', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $older = Transaction::factory()->for($user)->buy()->create([
        'created_at' => now()->subMinute(),
    ]);

    $newer = Transaction::factory()->for($user)->sell()->create([
        'created_at' => now(),
    ]);

    Transaction::factory()->for($other)->buy()->create();

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/transactions')->assertOk();

    $ids = collect($response->json('data'))->pluck('id')->all();

    expect($ids)->toBe([$newer->id, $older->id]);
    expect($response->json('data.0.type'))->toBe(TransactionType::SELL->value);
    expect($response->json('data.1.type'))->toBe(TransactionType::BUY->value);
    expect($response->json('data'))->toHaveCount(2);
});

test('transactions endpoint filters by buy type', function (): void {
    $user = User::factory()->create();

    $buy = Transaction::factory()->for($user)->buy()->create();
    Transaction::factory()->for($user)->sell()->create();

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/transactions?type=BUY')->assertOk();

    $ids = collect($response->json('data'))->pluck('id')->all();

    expect($ids)->toBe([$buy->id]);
    expect($response->json('data.0.type'))->toBe(TransactionType::BUY->value);
});

test('transactions endpoint filters by sell type', function (): void {
    $user = User::factory()->create();

    Transaction::factory()->for($user)->buy()->create();
    $sell = Transaction::factory()->for($user)->sell()->create();

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/transactions?type=SELL')->assertOk();

    $ids = collect($response->json('data'))->pluck('id')->all();

    expect($ids)->toBe([$sell->id]);
    expect($response->json('data.0.type'))->toBe(TransactionType::SELL->value);
});

test('transactions endpoint rejects invalid type filter', function (): void {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/transactions?type=INVALID')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

test('transactions endpoint returns relative pagination links', function (): void {
    $user = User::factory()->create();

    Transaction::factory()->for($user)->buy()->count(16)->create();

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/transactions?type=BUY')->assertOk();

    expect($response->json('links.first'))->toBe('/transactions?type=BUY&page=1');
    expect($response->json('links.next'))->toBe('/transactions?type=BUY&page=2');
    expect($response->json('meta.path'))->toBe('/transactions');
});
