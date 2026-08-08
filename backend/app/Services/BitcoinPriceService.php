<?php

namespace App\Services;

use App\Support\Money;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class BitcoinPriceService
{
    /**
     * @return array{price: string, expires_at: string}
     */
    public function getQuote(): array
    {
        $cacheKey = (string) config('bitcoin.cache_key');
        $ttl = (int) config('bitcoin.cache_ttl_seconds');

        $cached = Cache::get($cacheKey);

        if ($this->isValidQuote($cached)) {
            return $cached;
        }

        $quote = [
            'price' => $this->generatePrice(),
            'expires_at' => now()->utc()->addSeconds($ttl)->toIso8601ZuluString(),
        ];

        Cache::put($cacheKey, $quote, $ttl);

        return $quote;
    }

    public function getPrice(): string
    {
        return $this->getQuote()['price'];
    }

    public function generatePrice(): string
    {
        $min = Money::normalizeBrl((string) config('bitcoin.min_price'));
        $max = Money::normalizeBrl((string) config('bitcoin.max_price'));

        if (Money::compare($min, $max, Money::BRL_SCALE) > 0) {
            throw new RuntimeException('Invalid Bitcoin price range configuration.');
        }

        $minCents = (int) bcmul($min, '100', 0);
        $maxCents = (int) bcmul($max, '100', 0);
        $priceCents = random_int($minCents, $maxCents);

        return Money::normalizeBrl(bcdiv((string) $priceCents, '100', Money::BRL_SCALE));
    }

    /**
     * @return ($cached is array{price: string, expires_at: string}) bool
     */
    private function isValidQuote(mixed $cached): bool
    {
        return is_array($cached)
            && isset($cached['price'], $cached['expires_at'])
            && is_string($cached['price'])
            && is_string($cached['expires_at']);
    }
}
