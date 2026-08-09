<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TransactionService
{
    public function list(User $user, ?TransactionType $type = null): LengthAwarePaginator
    {
        return $user->transactions()
            ->when($type !== null, fn ($query) => $query->where('type', $type))
            ->latest('id')
            ->paginate(15)
            ->withPath('/transactions')
            ->withQueryString();
    }
}
