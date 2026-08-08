<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('authenticated user can view own wallet', function (): void {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/wallet')
        ->assertOk()
        ->assertJsonPath('data.brl_balance', '10000.00')
        ->assertJsonPath('data.btc_balance', '0.00000000');
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
