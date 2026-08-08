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
