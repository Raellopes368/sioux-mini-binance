<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    /**
     * @return array{user: User, token: string, refresh_token: string}
     */
    public function register(string $name, string $email, string $password): array
    {
        return DB::transaction(function () use ($name, $email, $password): array {
            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);

            $user->wallet()->create([
                'brl_balance' => (string) config('wallet.initial_brl_balance'),
                'btc_balance' => (string) config('wallet.initial_btc_balance'),
            ]);

            return [
                'user' => $user->load('wallet'),
                ...$this->issueTokenPair($user),
            ];
        });
    }

    /**
     * @return array{user: User, token: string, refresh_token: string}
     */
    public function login(string $email, string $password): array
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais informadas estão incorretas.'],
            ]);
        }

        return [
            'user' => $user->load('wallet'),
            ...$this->issueTokenPair($user),
        ];
    }

    /**
     * @return array{token: string, refresh_token: string}
     */
    public function refresh(string $refreshToken): array
    {
        $stored = RefreshToken::query()
            ->where('token', hash('sha256', $refreshToken))
            ->first();

        if ($stored === null) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Refresh token inválido ou expirado.'],
            ]);
        }

        if ($stored->isExpired()) {
            $stored->delete();

            throw ValidationException::withMessages([
                'refresh_token' => ['Refresh token inválido ou expirado.'],
            ]);
        }

        return DB::transaction(function () use ($stored): array {
            $locked = RefreshToken::query()
                ->whereKey($stored->id)
                ->lockForUpdate()
                ->first();

            if ($locked === null) {
                throw ValidationException::withMessages([
                    'refresh_token' => ['Refresh token inválido ou expirado.'],
                ]);
            }

            $user = $locked->user;
            $accessTokenId = $locked->personal_access_token_id;

            $locked->delete();
            $user->tokens()->whereKey($accessTokenId)->delete();

            return $this->issueTokenPair($user);
        });
    }

    public function logout(User $user): void
    {
        $accessToken = $user->currentAccessToken();

        if (! $accessToken instanceof PersonalAccessToken) {
            return;
        }

        RefreshToken::query()
            ->where('personal_access_token_id', $accessToken->id)
            ->delete();

        $accessToken->delete();
    }

    /**
     * @return array{token: string, refresh_token: string}
     */
    private function issueTokenPair(User $user): array
    {
        $accessMinutes = (int) config('sanctum.access_token_expiration', 60);
        $refreshMinutes = (int) config('sanctum.refresh_token_expiration', 60 * 24 * 30);

        $newAccessToken = $user->createToken(
            'access',
            ['*'],
            now()->addMinutes($accessMinutes),
        );

        $refreshPlain = Str::random(64);

        RefreshToken::query()->create([
            'user_id' => $user->id,
            'personal_access_token_id' => $newAccessToken->accessToken->id,
            'token' => hash('sha256', $refreshPlain),
            'expires_at' => now()->addMinutes($refreshMinutes),
        ]);

        return [
            'token' => $newAccessToken->plainTextToken,
            'refresh_token' => $refreshPlain,
        ];
    }
}
