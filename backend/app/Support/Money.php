<?php

namespace App\Support;

use InvalidArgumentException;

final class Money
{
    public const BRL_SCALE = 2;

    public const BTC_SCALE = 8;

    public static function normalizeBrl(string|int|float $amount): string
    {
        return self::normalize($amount, self::BRL_SCALE);
    }

    public static function normalizeBtc(string|int|float $amount): string
    {
        return self::normalize($amount, self::BTC_SCALE);
    }

    public static function add(string $left, string $right, int $scale): string
    {
        return bcadd($left, $right, $scale);
    }

    public static function sub(string $left, string $right, int $scale): string
    {
        return bcsub($left, $right, $scale);
    }

    public static function mul(string $left, string $right, int $scale): string
    {
        return bcmul($left, $right, $scale);
    }

    public static function div(string $left, string $right, int $scale): string
    {
        if (bccomp($right, '0', $scale) === 0) {
            throw new InvalidArgumentException('Division by zero.');
        }

        return bcdiv($left, $right, $scale);
    }

    public static function compare(string $left, string $right, int $scale): int
    {
        return bccomp($left, $right, $scale);
    }

    public static function isPositive(string $amount, int $scale): bool
    {
        return self::compare($amount, '0', $scale) > 0;
    }

    public static function isNegative(string $amount, int $scale): bool
    {
        return self::compare($amount, '0', $scale) < 0;
    }

    private static function normalize(string|int|float $amount, int $scale): string
    {
        if (is_string($amount)) {
            $amount = trim($amount);
        }

        if (! is_numeric($amount)) {
            throw new InvalidArgumentException('Invalid monetary amount.');
        }

        return bcadd((string) $amount, '0', $scale);
    }
}
