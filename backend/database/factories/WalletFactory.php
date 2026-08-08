<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
{
    protected $model = Wallet::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'brl_balance' => (string) config('wallet.initial_brl_balance', '10000.00'),
            'btc_balance' => (string) config('wallet.initial_btc_balance', '0.00000000'),
        ];
    }

    public function withBalances(string $brl, string $btc): static
    {
        return $this->state(fn (): array => [
            'brl_balance' => $brl,
            'btc_balance' => $btc,
        ]);
    }
}
