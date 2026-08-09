<?php

use App\Models\RefreshToken;
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
        ->assertJsonStructure(['token', 'refresh_token', 'user' => ['id', 'name', 'email']])
        ->assertJsonMissingPath('user.password');

    $user = User::query()->where('email', 'israel@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->wallet)->not->toBeNull();
    expect($user->wallet->brl_balance)->toBe('10000.00');
    expect($user->wallet->btc_balance)->toBe('0.00000000');
    expect(Hash::check('password', $user->password))->toBeTrue();
    expect($user->refreshTokens()->count())->toBe(1);
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
        ->assertJsonStructure(['token', 'refresh_token', 'user' => ['id', 'email']]);
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

test('logout revokes the current access and refresh tokens', function (): void {
    $user = User::factory()->create([
        'email' => 'logout@example.com',
        'password' => 'password',
    ]);

    $login = $this->postJson('/api/login', [
        'email' => 'logout@example.com',
        'password' => 'password',
    ])->assertOk();

    expect($user->fresh()->tokens()->count())->toBe(1);
    expect($user->fresh()->refreshTokens()->count())->toBe(1);

    $this->withToken($login->json('token'))
        ->postJson('/api/logout')
        ->assertOk();

    expect($user->fresh()->tokens()->count())->toBe(0);
    expect($user->fresh()->refreshTokens()->count())->toBe(0);
});

test('user can refresh tokens', function (): void {
    User::factory()->create([
        'email' => 'refresh@example.com',
        'password' => 'password',
    ]);

    $login = $this->postJson('/api/login', [
        'email' => 'refresh@example.com',
        'password' => 'password',
    ])->assertOk();

    $refreshToken = $login->json('refresh_token');

    $response = $this->postJson('/api/refresh', [
        'refresh_token' => $refreshToken,
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token', 'refresh_token']);

    expect($response->json('token'))->not->toBe($login->json('token'));
    expect($response->json('refresh_token'))->not->toBe($refreshToken);

    $this->withToken($response->json('token'))
        ->getJson('/api/me')
        ->assertOk();
});

test('refresh token is rotated and cannot be reused', function (): void {
    User::factory()->create([
        'email' => 'rotate@example.com',
        'password' => 'password',
    ]);

    $login = $this->postJson('/api/login', [
        'email' => 'rotate@example.com',
        'password' => 'password',
    ])->assertOk();

    $refreshToken = $login->json('refresh_token');

    $this->postJson('/api/refresh', [
        'refresh_token' => $refreshToken,
    ])->assertOk();

    $this->postJson('/api/refresh', [
        'refresh_token' => $refreshToken,
    ])->assertUnprocessable();
});

test('refresh fails with invalid token', function (): void {
    $this->postJson('/api/refresh', [
        'refresh_token' => 'invalid-refresh-token',
    ])->assertUnprocessable();
});

test('refresh fails with expired token', function (): void {
    $user = User::factory()->create();
    $accessToken = $user->createToken('access')->accessToken;

    RefreshToken::query()->create([
        'user_id' => $user->id,
        'personal_access_token_id' => $accessToken->id,
        'token' => hash('sha256', 'expired-refresh-token'),
        'expires_at' => now()->subMinute(),
    ]);

    $this->postJson('/api/refresh', [
        'refresh_token' => 'expired-refresh-token',
    ])->assertUnprocessable();

    expect(RefreshToken::query()->count())->toBe(0);
});

test('private endpoints require authentication', function (): void {
    $this->getJson('/api/wallet')->assertUnauthorized();
    $this->postJson('/api/trade/buy', ['amount' => 100])->assertUnauthorized();
    $this->postJson('/api/trade/sell', ['amount' => 0.001])->assertUnauthorized();
    $this->getJson('/api/transactions')->assertUnauthorized();
    $this->getJson('/api/transactions/1')->assertUnauthorized();
    $this->postJson('/api/logout')->assertUnauthorized();
});
