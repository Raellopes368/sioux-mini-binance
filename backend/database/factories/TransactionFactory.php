<?php

namespace Database\Factories;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => TransactionType::BUY,
            'btc_amount' => '0.00400000',
            'brl_amount' => '1000.00',
            'btc_price' => '250000.00',
        ];
    }

    public function buy(): static
    {
        return $this->state(fn (): array => [
            'type' => TransactionType::BUY,
        ]);
    }

    public function sell(): static
    {
        return $this->state(fn (): array => [
            'type' => TransactionType::SELL,
        ]);
    }
}
