<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

test('user can register and receives an initial wallet', function (): void {
    $response = $this->postJson('/api/register', [
        'name' => 'Israel',
        'email' => 'israel@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertCreated()
        ->assertJsonPath('user.email', 'israel@example.com')
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
        ->assertJsonMissingPath('user.password');

    $user = User::query()->where('email', 'israel@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->wallet)->not->toBeNull();
    expect($user->wallet->brl_balance)->toBe('10000.00');
    expect($user->wallet->btc_balance)->toBe('0.00000000');
    expect(Hash::check('password', $user->password))->toBeTrue();
});

test('user can login with valid credentials', function (): void {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'login@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token', 'user' => ['id', 'email']]);
});

test('login fails with invalid credentials', function (): void {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => 'password',
    ]);

    $this->postJson('/api/login', [
        'email' => 'login@example.com',
        'password' => 'wrong-password',
    ])->assertUnprocessable();
});

test('me endpoint requires authentication', function (): void {
    $this->getJson('/api/me')->assertUnauthorized();
});

test('authenticated user can access me', function (): void {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonMissingPath('data.password');
});

test('logout revokes the current access token', function (): void {
    $user = User::factory()->create();
    $plainTextToken = $user->createToken('api')->plainTextToken;

    $this->withToken($plainTextToken)
        ->postJson('/api/logout')
        ->assertOk();

    expect($user->fresh()->tokens()->count())->toBe(0);
});
test('private endpoints require authentication', function (): void {
    $this->getJson('/api/wallet')->assertUnauthorized();
    $this->postJson('/api/trade/buy', ['amount' => 100])->assertUnauthorized();
    $this->postJson('/api/trade/sell', ['amount' => 0.001])->assertUnauthorized();
    $this->getJson('/api/transactions')->assertUnauthorized();
    $this->postJson('/api/logout')->assertUnauthorized();
});
