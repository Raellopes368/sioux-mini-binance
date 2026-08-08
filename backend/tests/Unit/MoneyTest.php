<?php

use App\Support\Money;

test('money operations avoid floating point precision issues', function (): void {
    expect(Money::add('0.10', '0.20', Money::BRL_SCALE))->toBe('0.30');
    expect(Money::sub('10000.00', '0.10', Money::BRL_SCALE))->toBe('9999.90');
    expect(Money::mul('0.00200000', '250000.00', Money::BRL_SCALE))->toBe('500.00');
    expect(Money::div('1000.00', '250000.00', Money::BTC_SCALE))->toBe('0.00400000');
});

test('money compare and positivity helpers work', function (): void {
    expect(Money::compare('1000.00', '999.99', Money::BRL_SCALE))->toBe(1);
    expect(Money::isPositive('0.00000001', Money::BTC_SCALE))->toBeTrue();
    expect(Money::isPositive('0.00', Money::BRL_SCALE))->toBeFalse();
    expect(Money::isNegative('-1.00', Money::BRL_SCALE))->toBeTrue();
});
